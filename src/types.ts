export type CommentCategory = 'bug' | 'question' | 'suggestion' | 'nitpick' | 'note'

export interface Comment {
  id: string
  filePath: string
  startLine: number
  endLine: number
  text: string
  category: CommentCategory
  createdAt: string
  updatedAt: string
}
