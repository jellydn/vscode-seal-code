import type { Comment, CommentCategory } from '../../src/types'

export function filterComments(
  comments: Comment[],
  categoryFilter?: CommentCategory,
  currentFilePath?: string,
  filenameFilter?: string,
  showCurrentFileOnly?: boolean,
): Comment[] {
  let filteredComments = [...comments]

  if (categoryFilter) {
    filteredComments = filteredComments.filter(c => c.category === categoryFilter)
  }

  if (showCurrentFileOnly && currentFilePath) {
    filteredComments = filteredComments.filter(c => c.filePath === currentFilePath)
  }

  if (filenameFilter) {
    filteredComments = filteredComments.filter(c => c.filePath === filenameFilter)
  }

  return filteredComments
}

export function groupAndSortComments(comments: Comment[]): Array<{ filePath: string, comments: Comment[] }> {
  const commentsByFile = new Map<string, Comment[]>()
  for (const comment of comments) {
    const existing = commentsByFile.get(comment.filePath) || []
    existing.push(comment)
    commentsByFile.set(comment.filePath, existing)
  }

  const result: Array<{ filePath: string, comments: Comment[] }> = []
  for (const [filePath, fileComments] of commentsByFile) {
    const sortedComments = fileComments.sort((a, b) => a.startLine - b.startLine)
    result.push({ filePath, comments: sortedComments })
  }

  return result.sort((a, b) => a.filePath.localeCompare(b.filePath))
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  if (maxLength <= 3) {
    return '...'
  }
  return `${text.slice(0, maxLength - 3)}...`
}

export function formatCommentLabel(comment: Comment, maxLength: number = 40): string {
  return truncateText(comment.text.replace(/\n/g, ' '), maxLength)
}

export function formatLineInfo(startLine: number, endLine: number): string {
  return startLine === endLine
    ? `L${startLine}`
    : `L${startLine}-${endLine}`
}

export function formatCommentDescription(comment: Comment): string {
  const lineInfo = formatLineInfo(comment.startLine, comment.endLine)
  return `${comment.category} ${lineInfo}`
}
