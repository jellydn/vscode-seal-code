import type { DecorationOptions, TextEditor, TextEditorDecorationType } from 'vscode'
import type { Comment, CommentCategory } from './types'
import * as path from 'node:path'
import { MarkdownString, window, workspace } from 'vscode'
import { CommentStorage } from './CommentStorage'
import { config } from './config'

const storage = new CommentStorage()
let initialized = false

const gutterDecorationTypes: Map<CommentCategory, TextEditorDecorationType> = new Map()
const inlineDecorationTypes: Map<CommentCategory, TextEditorDecorationType> = new Map()
const backgroundDecorationTypes: Map<CommentCategory, TextEditorDecorationType> = new Map()

const ALL_CATEGORIES: CommentCategory[] = ['bug', 'question', 'suggestion', 'nitpick', 'note']
const categoryVisibility: Map<CommentCategory, boolean> = new Map(
  ALL_CATEGORIES.map(category => [category, true]),
)

export function isCategoryVisible(category: CommentCategory): boolean {
  return categoryVisibility.get(category) ?? true
}

export function toggleCategoryVisibility(category: CommentCategory): void {
  const current = categoryVisibility.get(category) ?? true
  categoryVisibility.set(category, !current)
}

export function showAllCategories(): void {
  for (const category of ALL_CATEGORIES) {
    categoryVisibility.set(category, true)
  }
}

export function hideAllCategories(): void {
  for (const category of ALL_CATEGORIES) {
    categoryVisibility.set(category, false)
  }
}

const DEFAULT_COLORS: Record<CommentCategory, string> = {
  bug: '#f44336',
  question: '#2196f3',
  suggestion: '#4caf50',
  nitpick: '#ff9800',
  note: '#9e9e9e',
}

function hexToRgba(hex: string, alpha: number): string {
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function getCategoryColor(category: CommentCategory): string {
  const customColors = config.categoryColors
  return customColors?.[category] ?? DEFAULT_COLORS[category]
}

function getExtensionPath(): string {
  return path.join(__dirname, '..')
}

function createDecorationTypes(): void {
  const categories: { category: CommentCategory, iconName: string }[] = [
    { category: 'bug', iconName: 'bug' },
    { category: 'question', iconName: 'question' },
    { category: 'suggestion', iconName: 'suggestion' },
    { category: 'nitpick', iconName: 'nitpick' },
    { category: 'note', iconName: 'note' },
  ]

  for (const { category, iconName } of categories) {
    const iconPath = path.join(getExtensionPath(), 'res', 'icons', `${iconName}.svg`)
    const color = getCategoryColor(category)

    const gutterDecorationType = window.createTextEditorDecorationType({
      gutterIconPath: iconPath,
      gutterIconSize: 'contain',
    })
    gutterDecorationTypes.set(category, gutterDecorationType)

    const backgroundDecorationType = window.createTextEditorDecorationType({
      backgroundColor: hexToRgba(color, 0.1),
      isWholeLine: true,
    })
    backgroundDecorationTypes.set(category, backgroundDecorationType)

    const inlineDecorationType = window.createTextEditorDecorationType({})
    inlineDecorationTypes.set(category, inlineDecorationType)
  }
}

async function ensureInitialized(): Promise<boolean> {
  if (initialized) {
    return true
  }

  if (!workspace.workspaceFolders?.length) {
    return false
  }

  await storage.load()
  createDecorationTypes()
  initialized = true
  return true
}

export function getStorage(): CommentStorage {
  return storage
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  return `${text.slice(0, maxLength - 3)}...`
}

function getCategoryIcon(category: CommentCategory): string {
  const icons: Record<CommentCategory, string> = {
    bug: '🐛',
    question: '❓',
    suggestion: '💡',
    nitpick: '📝',
    note: '📌',
  }
  return icons[category]
}

export async function updateDecorations(editor: TextEditor): Promise<void> {
  if (!await ensureInitialized()) {
    return
  }

  const filePath = workspace.asRelativePath(editor.document.uri)
  const comments = storage.getByFilePath(filePath)

  const showGutter = config.showGutterIcons ?? true
  const showBackground = config.showLineBackground ?? true
  const showInline = config.showInlineDecorations ?? true

  const gutterDecorationsByCategory: Map<CommentCategory, DecorationOptions[]> = new Map()
  const backgroundDecorationsByCategory: Map<CommentCategory, DecorationOptions[]> = new Map()
  const inlineDecorationsByCategory: Map<CommentCategory, DecorationOptions[]> = new Map()

  const { Range } = await import('vscode')

  for (const comment of comments) {
    const category = comment.category
    if (!gutterDecorationsByCategory.has(category)) {
      gutterDecorationsByCategory.set(category, [])
      backgroundDecorationsByCategory.set(category, [])
      inlineDecorationsByCategory.set(category, [])
    }

    const startLine = comment.startLine - 1
    const endLine = comment.endLine - 1
    const color = getCategoryColor(category)
    const truncatedText = truncateText(comment.text.replace(/\n/g, ' '), 50)

    const lineEndColumn = editor.document.lineAt(startLine).text.length
    const range = editor.document.validateRange(
      new Range(startLine, 0, endLine, lineEndColumn),
    )
    const hoverMessage = createHoverMessage(comment)

    gutterDecorationsByCategory.get(category)?.push({
      range,
      hoverMessage,
    })

    backgroundDecorationsByCategory.get(category)?.push({
      range,
    })

    inlineDecorationsByCategory.get(category)?.push({
      range,
      renderOptions: {
        after: {
          contentText: ` ${getCategoryIcon(category)} ${truncatedText}`,
          color,
          fontStyle: 'italic',
          margin: '0 0 0 2em',
        },
      },
    })
  }

  for (const [category, decorationType] of gutterDecorationTypes) {
    const decorations = showGutter ? (gutterDecorationsByCategory.get(category) || []) : []
    editor.setDecorations(decorationType, decorations)
  }

  for (const [category, decorationType] of backgroundDecorationTypes) {
    const decorations = showBackground ? (backgroundDecorationsByCategory.get(category) || []) : []
    editor.setDecorations(decorationType, decorations)
  }

  for (const [category, decorationType] of inlineDecorationTypes) {
    const decorations = showInline ? (inlineDecorationsByCategory.get(category) || []) : []
    editor.setDecorations(decorationType, decorations)
  }
}

function createHoverMessage(comment: Comment): MarkdownString {
  const categoryLabel = getCategoryLabel(comment.category)
  const md = new MarkdownString()
  md.isTrusted = true
  md.supportThemeIcons = true

  md.appendMarkdown(`**${categoryLabel}** (Line ${comment.startLine}${comment.startLine !== comment.endLine ? `-${comment.endLine}` : ''})\n\n`)
  md.appendMarkdown(`${comment.text}\n\n`)
  md.appendMarkdown(`---\n\n`)

  const editArgs = encodeURIComponent(JSON.stringify({ id: comment.id }))
  const deleteArgs = encodeURIComponent(JSON.stringify({ id: comment.id }))
  md.appendMarkdown(`[$(edit) Edit](command:codeReview.editCommentById?${editArgs}) | [$(trash) Delete](command:codeReview.deleteCommentById?${deleteArgs})`)

  return md
}

function getCategoryLabel(category: CommentCategory): string {
  const labels: Record<CommentCategory, string> = {
    bug: '🐛 Bug',
    question: '❓ Question',
    suggestion: '💡 Suggestion',
    nitpick: '📝 Nitpick',
    note: '📌 Note',
  }
  return labels[category]
}

export async function refreshAllDecorations(): Promise<void> {
  if (!initialized) {
    await ensureInitialized()
  }

  await storage.load()

  for (const editor of window.visibleTextEditors) {
    await updateDecorations(editor)
  }
}

export function clearDecorations(editor: TextEditor): void {
  for (const decorationType of gutterDecorationTypes.values()) {
    editor.setDecorations(decorationType, [])
  }
  for (const decorationType of backgroundDecorationTypes.values()) {
    editor.setDecorations(decorationType, [])
  }
  for (const decorationType of inlineDecorationTypes.values()) {
    editor.setDecorations(decorationType, [])
  }
}

export function disposeDecorations(): void {
  for (const decorationType of gutterDecorationTypes.values()) {
    decorationType.dispose()
  }
  gutterDecorationTypes.clear()
  for (const decorationType of backgroundDecorationTypes.values()) {
    decorationType.dispose()
  }
  backgroundDecorationTypes.clear()
  for (const decorationType of inlineDecorationTypes.values()) {
    decorationType.dispose()
  }
  inlineDecorationTypes.clear()
}
