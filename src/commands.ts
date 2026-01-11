import type { Comment, CommentCategory } from './types'
import * as path from 'node:path'
import { commands, Position, Range, Selection, Uri, window, workspace } from 'vscode'
import { buildAICommand, formatCommentsForAI } from './aiReview'
import { AI_TOOLS } from './aiTools'
import { getStorage, refreshAllDecorations } from './decorations'
import { configs, displayName } from './generated/meta'
import {
  showCommentAddedMessage,
  showCommentDeletedMessage,
  showCommentsClearedMessage,
  showCommentsExportedMessage,
  showCommentsSentMessage,
  showCommentUpdatedMessage,
} from './messages'
import { getCodeReviewDir } from './storage'
import { getTreeDataProvider, refreshTreeView } from './treeView'

interface CommentItemLike {
  comment: Comment
}

function generateTerminalName(promptTemplateName?: string, aiTool?: string): string {
  const parts = [displayName]
  if (promptTemplateName) {
    parts.push(promptTemplateName)
  }
  if (aiTool) {
    parts.push(`(${aiTool})`)
  }
  return parts.join(' - ')
}

function extractComment(arg: Comment | CommentItemLike): Comment {
  if ('comment' in arg && arg.comment) {
    return arg.comment
  }
  return arg as Comment
}

let initialized = false

const CATEGORY_ITEMS: { label: string, value: CommentCategory, description: string }[] = [
  { label: '$(bug) Bug', value: 'bug', description: 'A bug or issue' },
  { label: '$(question) Question', value: 'question', description: 'A question or concern' },
  { label: '$(lightbulb) Suggestion', value: 'suggestion', description: 'A suggestion for improvement' },
  { label: '$(comment) Nitpick', value: 'nitpick', description: 'A minor nitpick' },
  { label: '$(note) Note', value: 'note', description: 'A general note' },
]

async function ensureInitialized(): Promise<boolean> {
  if (initialized) {
    return true
  }

  if (!workspace.workspaceFolders?.length) {
    window.showErrorMessage('No workspace folder open')
    return false
  }

  await getStorage().load()
  initialized = true
  return true
}

export async function addComment(): Promise<void> {
  const editor = window.activeTextEditor
  if (!editor) {
    window.showErrorMessage('No active editor')
    return
  }

  if (!await ensureInitialized()) {
    return
  }

  const text = await window.showInputBox({
    prompt: 'Enter your review comment',
    placeHolder: 'Type your comment here...',
  })

  if (!text) {
    return
  }

  const categoryItem = await window.showQuickPick(CATEGORY_ITEMS, {
    placeHolder: 'Select a category',
    title: 'Comment Category',
  })

  if (!categoryItem) {
    return
  }

  const selection = editor.selection
  const startLine = selection.start.line + 1
  const endLine = selection.end.line + 1

  const filePath = workspace.asRelativePath(editor.document.uri)

  await getStorage().add(filePath, startLine, endLine, text, categoryItem.value)

  await refreshAllDecorations()
  refreshTreeView()

  showCommentAddedMessage(filePath, startLine, endLine)
}

export async function navigateToComment(comment: Comment): Promise<void> {
  if (!workspace.workspaceFolders?.length) {
    window.showErrorMessage('No workspace folder open')
    return
  }

  const workspaceRoot = workspace.workspaceFolders[0].uri
  const fileUri = Uri.joinPath(workspaceRoot, comment.filePath)

  const document = await workspace.openTextDocument(fileUri)
  const editor = await window.showTextDocument(document)

  const line = comment.startLine - 1
  const position = new Position(line, 0)
  const range = new Range(position, position)

  editor.selection = new Selection(position, position)
  editor.revealRange(range, 1)
}

export async function editCommentById(arg: { id: string }): Promise<void> {
  if (!await ensureInitialized()) {
    return
  }

  const existingComment = await findCommentById(arg.id)
  if (!existingComment) {
    return
  }

  await editCommentInternal(existingComment)
}

async function editCommentInternal(existingComment: Comment): Promise<void> {
  const text = await window.showInputBox({
    prompt: 'Edit your review comment',
    placeHolder: 'Type your comment here...',
    value: existingComment.text,
  })

  if (text === undefined) {
    return
  }

  const categoryItem = await window.showQuickPick(CATEGORY_ITEMS, {
    placeHolder: 'Select a category',
    title: 'Comment Category',
  })

  if (!categoryItem) {
    return
  }

  await getStorage().update(existingComment.id, { text, category: categoryItem.value })

  await refreshAllDecorations()
  refreshTreeView()

  showCommentUpdatedMessage(existingComment)
}

export async function editComment(arg: Comment | CommentItemLike): Promise<void> {
  if (!await ensureInitialized()) {
    return
  }

  const comment = extractComment(arg)
  const existingComment = await findCommentById(comment.id)
  if (!existingComment) {
    return
  }

  await editCommentInternal(existingComment)
}

async function deleteCommentInternal(existingComment: Comment): Promise<void> {
  const confirmation = await window.showWarningMessage(
    `Delete comment "${existingComment.text.slice(0, 50)}${existingComment.text.length > 50 ? '...' : ''}"?`,
    { modal: true },
    'Delete',
  )

  if (confirmation !== 'Delete') {
    return
  }

  await getStorage().delete(existingComment.id)

  await refreshAllDecorations()
  refreshTreeView()

  showCommentDeletedMessage(existingComment)
}

async function findCommentById(id: string): Promise<Comment | null> {
  const storage = getStorage()
  const comment = storage.getById(id)
  if (!comment) {
    window.showErrorMessage('Comment not found')
    return null
  }
  return comment
}

export async function deleteCommentById(arg: { id: string }): Promise<void> {
  if (!await ensureInitialized()) {
    return
  }

  const existingComment = await findCommentById(arg.id)
  if (!existingComment) {
    return
  }

  await deleteCommentInternal(existingComment)
}

export async function deleteComment(arg: Comment | CommentItemLike): Promise<void> {
  if (!await ensureInitialized()) {
    return
  }

  const comment = extractComment(arg)
  const existingComment = await findCommentById(comment.id)
  if (!existingComment) {
    return
  }

  await deleteCommentInternal(existingComment)
}

const FILTER_ITEMS: { label: string, value: CommentCategory | null, description: string }[] = [
  { label: '$(list-flat) All', value: null, description: 'Show all comments' },
  { label: '$(bug) Bug', value: 'bug', description: 'Show only bugs' },
  { label: '$(question) Question', value: 'question', description: 'Show only questions' },
  { label: '$(lightbulb) Suggestion', value: 'suggestion', description: 'Show only suggestions' },
  { label: '$(comment) Nitpick', value: 'nitpick', description: 'Show only nitpicks' },
  { label: '$(note) Note', value: 'note', description: 'Show only notes' },
]

export async function filterByCategory(): Promise<void> {
  const provider = getTreeDataProvider()
  if (!provider) {
    return
  }

  const currentFilter = provider.getCategoryFilter()
  const totalCount = provider.getTotalCount()

  const items = FILTER_ITEMS.map((item) => {
    const count = item.value === null
      ? totalCount
      : getStorage().getAll().filter(c => c.category === item.value).length
    return {
      ...item,
      description: `${item.description} (${count})`,
      picked: item.value === currentFilter,
    }
  })

  const selected = await window.showQuickPick(items, {
    placeHolder: 'Filter by category',
    title: 'Category Filter',
  })

  if (selected === undefined) {
    return
  }

  provider.setCategoryFilter(selected.value)
}

export async function toggleFileFilter(): Promise<void> {
  const provider = getTreeDataProvider()
  if (!provider) {
    return
  }

  const currentValue = provider.getShowCurrentFileOnly()
  provider.setShowCurrentFileOnly(!currentValue)

  const message = !currentValue
    ? 'Showing comments for current file only'
    : 'Showing comments for all files'
  window.showInformationMessage(message)
}

export function updateCurrentFilePath(): void {
  const provider = getTreeDataProvider()
  if (!provider) {
    return
  }

  const editor = window.activeTextEditor
  if (editor) {
    const filePath = workspace.asRelativePath(editor.document.uri)
    provider.setCurrentFilePath(filePath)
  }
  else {
    provider.setCurrentFilePath(null)
  }
}

export async function filterByFilename(): Promise<void> {
  const provider = getTreeDataProvider()
  if (!provider) {
    return
  }

  const storage = getStorage()
  const comments = storage.getAll()
  const uniqueFiles = [...new Set(comments.map(c => c.filePath))].sort()

  if (uniqueFiles.length === 0) {
    window.showInformationMessage('No comments to filter')
    return
  }

  const currentFilter = provider.getFilenameFilter()

  const items = [
    { label: '$(list-flat) All Files', value: null as string | null, description: 'Show comments from all files' },
    ...uniqueFiles.map(file => ({
      label: `$(file) ${path.basename(file)}`,
      value: file,
      description: file,
    })),
  ]

  const selected = await window.showQuickPick(items, {
    placeHolder: currentFilter ? `Current: ${currentFilter}` : 'Filter by filename',
    title: 'File Filter',
  })

  if (selected === undefined) {
    return
  }

  provider.setFilenameFilter(selected.value)
}

export async function handleFileRename(oldUri: Uri, newUri: Uri): Promise<void> {
  if (!await ensureInitialized()) {
    return
  }

  const storage = getStorage()
  const oldPath = workspace.asRelativePath(oldUri)
  const newPath = workspace.asRelativePath(newUri)

  const updated = await storage.updateFilePaths(oldPath, newPath)

  if (updated > 0) {
    await refreshAllDecorations()
    refreshTreeView()
  }
}

function getLanguageFromFilePath(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  const langMap: Record<string, string> = {
    '.ts': 'typescript',
    '.tsx': 'tsx',
    '.js': 'javascript',
    '.jsx': 'jsx',
    '.py': 'python',
    '.rb': 'ruby',
    '.java': 'java',
    '.kt': 'kotlin',
    '.go': 'go',
    '.rs': 'rust',
    '.cpp': 'cpp',
    '.c': 'c',
    '.h': 'c',
    '.hpp': 'cpp',
    '.cs': 'csharp',
    '.swift': 'swift',
    '.php': 'php',
    '.html': 'html',
    '.css': 'css',
    '.scss': 'scss',
    '.less': 'less',
    '.json': 'json',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.xml': 'xml',
    '.md': 'markdown',
    '.sql': 'sql',
    '.sh': 'bash',
    '.bash': 'bash',
    '.zsh': 'zsh',
    '.vue': 'vue',
    '.svelte': 'svelte',
  }
  return langMap[ext] || ''
}

async function getCodeSnippet(filePath: string, startLine: number, endLine: number): Promise<string | null> {
  if (!workspace.workspaceFolders?.length) {
    return null
  }

  const workspaceRoot = workspace.workspaceFolders[0].uri
  const fileUri = Uri.joinPath(workspaceRoot, filePath)

  try {
    const document = await workspace.openTextDocument(fileUri)
    const contextLines = 3
    const snippetStart = Math.max(0, startLine - 1 - contextLines)
    const snippetEnd = Math.min(document.lineCount, endLine + contextLines)

    const lines: string[] = []
    for (let i = snippetStart; i < snippetEnd; i++) {
      const lineNum = i + 1
      const prefix = (lineNum >= startLine && lineNum <= endLine) ? '>' : ' '
      lines.push(`${prefix} ${lineNum.toString().padStart(4)}: ${document.lineAt(i).text}`)
    }

    return lines.join('\n')
  }
  catch {
    return null
  }
}

function getCategoryEmoji(category: CommentCategory): string {
  const emojiMap: Record<CommentCategory, string> = {
    bug: '🐛',
    question: '❓',
    suggestion: '💡',
    nitpick: '🔍',
    note: '📝',
  }
  return emojiMap[category]
}

function getCategoryColor(category: CommentCategory): string {
  const colorMap: Record<CommentCategory, string> = {
    bug: '#f44336',
    question: '#2196f3',
    suggestion: '#4caf50',
    nitpick: '#ff9800',
    note: '#9e9e9e',
  }
  return colorMap[category]
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function exportMarkdown(): Promise<void> {
  if (!await ensureInitialized()) {
    return
  }

  const storage = getStorage()
  const comments = storage.getAll()

  if (comments.length === 0) {
    window.showInformationMessage('No comments to export')
    return
  }

  const commentsByFile = new Map<string, Comment[]>()
  for (const comment of comments) {
    const existing = commentsByFile.get(comment.filePath) || []
    existing.push(comment)
    commentsByFile.set(comment.filePath, existing)
  }

  const lines: string[] = [
    '# Code Review Report',
    '',
    `Generated: ${new Date().toLocaleString()}`,
    '',
    `Total comments: ${comments.length}`,
    '',
    '---',
    '',
  ]

  for (const [filePath, fileComments] of commentsByFile) {
    lines.push(`## ${filePath}`)
    lines.push('')

    const sorted = fileComments.sort((a, b) => a.startLine - b.startLine)
    const language = getLanguageFromFilePath(filePath)

    for (const comment of sorted) {
      const lineRange = comment.startLine === comment.endLine
        ? `Line ${comment.startLine}`
        : `Lines ${comment.startLine}-${comment.endLine}`

      lines.push(`### ${getCategoryEmoji(comment.category)} ${comment.category.toUpperCase()} - ${lineRange}`)
      lines.push('')
      lines.push(comment.text)
      lines.push('')
      lines.push(`*Created: ${new Date(comment.createdAt).toLocaleString()}*`)
      lines.push('')

      const snippet = await getCodeSnippet(filePath, comment.startLine, comment.endLine)
      if (snippet) {
        lines.push(`\`\`\`${language}`)
        lines.push(snippet)
        lines.push('```')
        lines.push('')
      }
    }
  }

  const dir = await getCodeReviewDir()
  if (!dir) {
    window.showErrorMessage('Could not get code review directory')
    return
  }

  const outputPath = Uri.joinPath(dir, 'review-report.md')
  await workspace.fs.writeFile(outputPath, new TextEncoder().encode(lines.join('\n')))

  const doc = await workspace.openTextDocument(outputPath)
  await window.showTextDocument(doc)
  showCommentsExportedMessage(comments.length, 'md')
}

export async function clearAll(): Promise<void> {
  if (!await ensureInitialized()) {
    return
  }

  const storage = getStorage()
  const comments = storage.getAll()

  if (comments.length === 0) {
    window.showInformationMessage('No comments to clear')
    return
  }

  const confirmation = await window.showWarningMessage(
    `Delete all ${comments.length} comments? This cannot be undone.`,
    { modal: true },
    'Delete All',
  )

  if (confirmation !== 'Delete All') {
    return
  }

  const count = await storage.clearAll()

  await refreshAllDecorations()
  refreshTreeView()

  showCommentsClearedMessage(count)
}

export async function exportHtml(): Promise<void> {
  if (!await ensureInitialized()) {
    return
  }

  const storage = getStorage()
  const comments = storage.getAll()

  if (comments.length === 0) {
    window.showInformationMessage('No comments to export')
    return
  }

  const commentsByFile = new Map<string, Comment[]>()
  for (const comment of comments) {
    const existing = commentsByFile.get(comment.filePath) || []
    existing.push(comment)
    commentsByFile.set(comment.filePath, existing)
  }

  const htmlParts: string[] = [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '  <title>Code Review Report</title>',
    '  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">',
    '  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>',
    '  <style>',
    '    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; background: #f5f5f5; }',
    '    h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }',
    '    h2 { color: #555; margin-top: 30px; }',
    '    .comment { background: white; border-radius: 8px; padding: 16px; margin: 16px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }',
    '    .comment-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }',
    '    .category-badge { padding: 4px 12px; border-radius: 12px; color: white; font-size: 12px; font-weight: bold; text-transform: uppercase; }',
    '    .line-info { color: #666; font-size: 14px; }',
    '    .comment-text { margin: 12px 0; font-size: 15px; line-height: 1.5; }',
    '    .timestamp { color: #999; font-size: 12px; }',
    '    pre { background: #f8f8f8; border-radius: 6px; padding: 12px; overflow-x: auto; margin: 12px 0; }',
    '    code { font-family: "SF Mono", Monaco, "Courier New", monospace; font-size: 13px; }',
    '    .highlighted-line { background: #fff3cd; }',
    '    a { color: #0066cc; text-decoration: none; }',
    '    a:hover { text-decoration: underline; }',
    '    .summary { background: white; padding: 16px; border-radius: 8px; margin-bottom: 20px; }',
    '  </style>',
    '</head>',
    '<body>',
    '  <h1>📋 Code Review Report</h1>',
    `  <div class="summary">`,
    `    <p><strong>Generated:</strong> ${escapeHtml(new Date().toLocaleString())}</p>`,
    `    <p><strong>Total comments:</strong> ${comments.length}</p>`,
    '  </div>',
  ]

  for (const [filePath, fileComments] of commentsByFile) {
    htmlParts.push(`  <h2>📁 ${escapeHtml(filePath)}</h2>`)

    const sorted = fileComments.sort((a, b) => a.startLine - b.startLine)
    const language = getLanguageFromFilePath(filePath)

    for (const comment of sorted) {
      const lineRange = comment.startLine === comment.endLine
        ? `Line ${comment.startLine}`
        : `Lines ${comment.startLine}-${comment.endLine}`

      const color = getCategoryColor(comment.category)
      const vscodeLinkLine = comment.startLine
      const vscodeLink = `vscode://file/${workspace.workspaceFolders?.[0]?.uri.fsPath}/${filePath}:${vscodeLinkLine}`

      htmlParts.push('  <div class="comment">')
      htmlParts.push('    <div class="comment-header">')
      htmlParts.push(`      <span class="category-badge" style="background: ${color}">${escapeHtml(comment.category)}</span>`)
      htmlParts.push(`      <span class="line-info"><a href="${escapeHtml(vscodeLink)}">${escapeHtml(lineRange)}</a></span>`)
      htmlParts.push('    </div>')
      htmlParts.push(`    <div class="comment-text">${escapeHtml(comment.text)}</div>`)
      htmlParts.push(`    <div class="timestamp">Created: ${escapeHtml(new Date(comment.createdAt).toLocaleString())}</div>`)

      const snippet = await getCodeSnippet(filePath, comment.startLine, comment.endLine)
      if (snippet) {
        const escapedSnippet = escapeHtml(snippet)
        htmlParts.push(`    <pre><code class="language-${language}">${escapedSnippet}</code></pre>`)
      }

      htmlParts.push('  </div>')
    }
  }

  htmlParts.push('  <script>hljs.highlightAll();</script>')
  htmlParts.push('</body>')
  htmlParts.push('</html>')

  const dir = await getCodeReviewDir()
  if (!dir) {
    window.showErrorMessage('Could not get code review directory')
    return
  }

  const outputPath = Uri.joinPath(dir, 'review-report.html')
  await workspace.fs.writeFile(outputPath, new TextEncoder().encode(htmlParts.join('\n')))

  const doc = await workspace.openTextDocument(outputPath)
  await window.showTextDocument(doc)
  showCommentsExportedMessage(comments.length, 'html')
}

async function pickPromptTemplate(formattedComments: string, files: string[]): Promise<{ prompt: string, templateName: string } | undefined> {
  const config = workspace.getConfiguration()
  const promptTemplates = config.get<Record<string, string>>(configs.promptTemplates.key, configs.promptTemplates.default as Record<string, string>)

  const templateNames = Object.keys(promptTemplates)
  const quickPickItems: { label: string, value: string | null }[] = templateNames.map(name => ({
    label: name,
    value: promptTemplates[name],
  }))
  quickPickItems.push({ label: '$(edit) Custom...', value: null })

  const selected = await window.showQuickPick(quickPickItems, {
    placeHolder: 'Select a prompt template',
    title: 'Prompt Template',
  })

  if (!selected) {
    return undefined
  }

  let template: string
  let templateName: string

  if (selected.value === null) {
    const customPrompt = await window.showInputBox({
      prompt: 'Enter custom prompt (use {{comments}} and {{files}} as placeholders)',
      placeHolder: 'Review these comments: {{comments}}',
    })
    if (!customPrompt) {
      return undefined
    }
    template = customPrompt
    templateName = 'Custom'
  }
  else {
    template = selected.value
    templateName = selected.label
  }

  const processedPrompt = template
    .replace('{{comments}}', formattedComments)
    .replace('{{files}}', files.join(', '))

  return { prompt: processedPrompt, templateName }
}

export async function sendToAI(): Promise<void> {
  if (!await ensureInitialized()) {
    return
  }

  const treeProvider = getTreeDataProvider()
  const categoryFilter = treeProvider?.getCategoryFilter()
  let comments = getStorage().getAll()

  if (categoryFilter) {
    comments = comments.filter(c => c.category === categoryFilter)
    await executeAIReview(comments, categoryFilter)
  }
  else {
    await executeAIReview(comments)
  }
}

async function executeAIReview(comments: Comment[], context: string = ''): Promise<void> {
  if (comments.length === 0) {
    window.showErrorMessage('No comments to send to AI')
    return
  }

  const { formattedComments, files } = formatCommentsForAI(comments)
  const promptResult = await pickPromptTemplate(formattedComments, files)

  if (!promptResult) {
    return
  }

  const { prompt, templateName } = promptResult

  const config = workspace.getConfiguration()
  let aiTool = config.get<string>(configs.aiTool.key, configs.aiTool.default)
  const aiToolCommand = config.get<string>(configs.aiToolCommand.key, configs.aiToolCommand.default)

  const showQuickPickForAI = config.get<boolean>(configs.showAIQuickPick.key, configs.showAIQuickPick.default)
  if (showQuickPickForAI) {
    const aiToolOptions = [
      { label: 'OpenCode', value: AI_TOOLS.OPENCODE },
      { label: 'Claude', value: AI_TOOLS.CLAUDE },
      { label: 'Custom', value: AI_TOOLS.CUSTOM },
    ]

    const selectedAITool = await window.showQuickPick(aiToolOptions, {
      placeHolder: 'Select AI tool',
      title: 'AI Tool Selection',
    })

    if (selectedAITool) {
      aiTool = selectedAITool.value
    }
  }

  const command = buildAICommand(aiTool, aiToolCommand, prompt)

  const terminalName = generateTerminalName(templateName, aiTool)
  const terminal = window.createTerminal(terminalName)
  terminal.sendText(command)
  terminal.show()

  showCommentsSentMessage(comments.length, context)
}

export async function sendSelectedToAI(): Promise<void> {
  if (!await ensureInitialized()) {
    return
  }

  const storage = getStorage()
  const allComments = storage.getAll()

  if (allComments.length === 0) {
    window.showErrorMessage('No comments to send to AI')
    return
  }

  const commentsByFile = new Map<string, Comment[]>()
  for (const comment of allComments) {
    const existing = commentsByFile.get(comment.filePath) || []
    existing.push(comment)
    commentsByFile.set(comment.filePath, existing)
  }

  const quickPickItems: { label: string, description: string, comment: Comment }[] = []
  for (const [filePath, fileComments] of commentsByFile) {
    for (const comment of fileComments) {
      const lineRange = comment.startLine === comment.endLine
        ? `${comment.startLine}`
        : `${comment.startLine}-${comment.endLine}`
      const truncatedText = comment.text.length > 50 ? `${comment.text.slice(0, 50)}...` : comment.text
      quickPickItems.push({
        label: truncatedText,
        description: `${filePath}:${lineRange}`,
        comment,
      })
    }
  }

  const selectedItems = await window.showQuickPick(quickPickItems, {
    canPickMany: true,
    placeHolder: 'Select comments to send to AI',
    title: 'Send Selected Comments to AI',
  })

  if (!selectedItems || selectedItems.length === 0) {
    return
  }

  const selectedComments = selectedItems.map(item => item.comment)
  await executeAIReview(selectedComments, 'selected')
}

export async function sendCategoryToAI(): Promise<void> {
  if (!await ensureInitialized()) {
    return
  }

  const allComments = getStorage().getAll()

  if (allComments.length === 0) {
    window.showErrorMessage('No comments to send to AI')
    return
  }

  const selectedCategory = await window.showQuickPick(CATEGORY_ITEMS, {
    placeHolder: 'Select category to send to AI',
    title: 'Send Category to AI',
  })

  if (!selectedCategory) {
    return
  }

  const filteredComments = allComments.filter(c => c.category === selectedCategory.value)

  if (filteredComments.length === 0) {
    window.showInformationMessage(`No ${selectedCategory.value} comments to send to AI`)
    return
  }

  await executeAIReview(filteredComments, selectedCategory.value)
}

export function registerCommands(): void {
  commands.registerCommand('codeReview.addComment', addComment)
  commands.registerCommand('codeReview.navigateToComment', navigateToComment)
  commands.registerCommand('codeReview.editComment', editComment)
  commands.registerCommand('codeReview.deleteComment', deleteComment)
  commands.registerCommand('codeReview.editCommentById', editCommentById)
  commands.registerCommand('codeReview.deleteCommentById', deleteCommentById)
  commands.registerCommand('codeReview.filterByCategory', filterByCategory)
  commands.registerCommand('codeReview.toggleFileFilter', toggleFileFilter)
  commands.registerCommand('codeReview.filterByFilename', filterByFilename)
  commands.registerCommand('codeReview.exportMarkdown', exportMarkdown)
  commands.registerCommand('codeReview.exportHtml', exportHtml)
  commands.registerCommand('codeReview.clearAll', clearAll)
  commands.registerCommand('codeReview.sendToAI', sendToAI)
  commands.registerCommand('codeReview.sendSelectedToAI', sendSelectedToAI)
  commands.registerCommand('codeReview.sendCategoryToAI', sendCategoryToAI)
}
