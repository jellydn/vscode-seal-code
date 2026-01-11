import type { Comment, CommentCategory } from '../../src/types'

export function createComment(overrides: Partial<Comment> = {}): Comment {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    filePath: '/test/path/file.ts',
    startLine: 1,
    endLine: 1,
    text: 'Test comment',
    category: 'suggestion',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

export function createComments(count: number, overrides: Partial<Comment> = {}): Comment[] {
  return Array.from({ length: count }, (_, i) =>
    createComment({
      startLine: i + 1,
      endLine: i + 1,
      text: `Test comment ${i + 1}`,
      ...overrides,
    }))
}

export const COMMENT_CATEGORIES: CommentCategory[] = ['bug', 'question', 'suggestion', 'nitpick', 'note']

export function createCommentsWithDifferentCategories(): Comment[] {
  return COMMENT_CATEGORIES.map((category, index) =>
    createComment({
      id: `comment-${category}`,
      text: `${category} comment`,
      category,
      startLine: index + 1,
      endLine: index + 1,
    }),
  )
}

export function createCommentsWithDifferentFiles(): Comment[] {
  return [
    createComment({ id: 'comment-1', filePath: 'src/file1.ts', text: 'Comment in file1' }),
    createComment({ id: 'comment-2', filePath: 'src/file2.ts', text: 'Comment in file2' }),
    createComment({ id: 'comment-3', filePath: 'src/file1.ts', text: 'Another comment in file1', startLine: 5, endLine: 5 }),
  ]
}

export function createMultiLineComments(): Comment[] {
  return [
    createComment({ id: 'multi-1', startLine: 1, endLine: 3, text: 'Multi-line comment' }),
    createComment({ id: 'multi-2', startLine: 10, endLine: 15, text: 'Another multi-line' }),
    createComment({ id: 'single-1', startLine: 20, endLine: 20, text: 'Single line' }),
  ]
}

export function createCommentsForExport(): Comment[] {
  return [
    createComment({
      id: 'export-1',
      filePath: 'src/example.ts',
      startLine: 5,
      endLine: 8,
      text: 'This is a <test> comment with "special" characters',
      category: 'bug',
    }),
    createComment({
      id: 'export-2',
      filePath: 'src/another.ts',
      startLine: 10,
      endLine: 10,
      text: 'Simple suggestion comment',
      category: 'suggestion',
    }),
  ]
}
