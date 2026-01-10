import type { Comment } from './types'

export interface FormattedCommentsResult {
  formattedComments: string
  files: string[]
}

export function formatCommentsForAI(comments: Comment[]): FormattedCommentsResult {
  const commentsByFile = new Map<string, Comment[]>()

  for (const comment of comments) {
    const existing = commentsByFile.get(comment.filePath) || []
    existing.push(comment)
    commentsByFile.set(comment.filePath, existing)
  }

  const lines: string[] = []
  const files: string[] = []

  for (const [filePath, fileComments] of commentsByFile) {
    files.push(filePath)
    for (const comment of fileComments) {
      const lineRange = comment.startLine === comment.endLine
        ? `${comment.startLine}`
        : `${comment.startLine}-${comment.endLine}`
      lines.push(`[${comment.category}] ${filePath}:${lineRange} - ${comment.text}`)
    }
  }

  return {
    formattedComments: lines.join('\n'),
    files,
  }
}

function escapeDoubleQuotes(str: string): string {
  return str.replace(/"/g, '\\"')
}

export function buildAICommand(tool: string, customCommand: string, prompt: string): string {
  const escapedPrompt = escapeDoubleQuotes(prompt)

  switch (tool) {
    case 'claude':
      return `claude -p --permission-mode plan "${escapedPrompt}"`
    case 'opencode':
      return `opencode run --agent plan "${escapedPrompt}"`
    case 'custom':
      return `${customCommand} "${escapedPrompt}"`
    default:
      return `claude -p --permission-mode plan "${escapedPrompt}"`
  }
}
