import type { Command, Event, ProviderResult, TreeDataProvider, TreeItem } from 'vscode'
import type { Comment, CommentCategory } from './types'
import * as path from 'node:path'
import { EventEmitter, TreeItemCollapsibleState, window } from 'vscode'
import { getStorage } from './decorations'

type CommentTreeItem = FileItem | CommentItem

class FileItem implements TreeItem {
  collapsibleState = TreeItemCollapsibleState.Expanded
  contextValue = 'file'

  constructor(
    public readonly filePath: string,
    public readonly comments: Comment[],
  ) {}

  get label(): string {
    return path.basename(this.filePath)
  }

  get description(): string {
    return `${this.comments.length} comment${this.comments.length !== 1 ? 's' : ''}`
  }

  get tooltip(): string {
    return this.filePath
  }

  get iconPath() {
    return undefined
  }
}

class CommentItem implements TreeItem {
  collapsibleState = TreeItemCollapsibleState.None
  contextValue = 'comment'

  constructor(
    public readonly comment: Comment,
  ) {}

  get label(): string {
    return this.truncateText(this.comment.text.replace(/\n/g, ' '), 40)
  }

  get description(): string {
    const lineInfo = this.comment.startLine === this.comment.endLine
      ? `L${this.comment.startLine}`
      : `L${this.comment.startLine}-${this.comment.endLine}`
    return lineInfo
  }

  get tooltip(): string {
    const categoryLabel = this.getCategoryLabel(this.comment.category)
    const lineInfo = this.comment.startLine === this.comment.endLine
      ? `Line ${this.comment.startLine}`
      : `Lines ${this.comment.startLine}-${this.comment.endLine}`
    return `${categoryLabel} - ${lineInfo}\n\n${this.comment.text}`
  }

  get iconPath() {
    const iconMap: Record<CommentCategory, string> = {
      bug: 'bug.svg',
      question: 'question.svg',
      suggestion: 'suggestion.svg',
      nitpick: 'nitpick.svg',
      note: 'note.svg',
    }
    const iconFile = iconMap[this.comment.category]
    return path.join(__dirname, '..', 'res', 'icons', iconFile)
  }

  get command(): Command {
    return {
      command: 'codeReview.navigateToComment',
      title: 'Go to Comment',
      arguments: [this.comment],
    }
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text
    }
    return `${text.slice(0, maxLength - 3)}...`
  }

  private getCategoryLabel(category: CommentCategory): string {
    const labels: Record<CommentCategory, string> = {
      bug: '🐛 Bug',
      question: '❓ Question',
      suggestion: '💡 Suggestion',
      nitpick: '📝 Nitpick',
      note: '📌 Note',
    }
    return labels[category]
  }
}

export class CommentTreeDataProvider implements TreeDataProvider<CommentTreeItem> {
  private _onDidChangeTreeData = new EventEmitter<CommentTreeItem | undefined | null | void>()
  readonly onDidChangeTreeData: Event<CommentTreeItem | undefined | null | void> = this._onDidChangeTreeData.event
  private categoryFilter: CommentCategory | null = null
  private showCurrentFileOnly = false
  private currentFilePath: string | null = null

  refresh(): void {
    this._onDidChangeTreeData.fire()
  }

  setCategoryFilter(category: CommentCategory | null): void {
    this.categoryFilter = category
    this.refresh()
  }

  getCategoryFilter(): CommentCategory | null {
    return this.categoryFilter
  }

  setShowCurrentFileOnly(value: boolean): void {
    this.showCurrentFileOnly = value
    this.refresh()
  }

  getShowCurrentFileOnly(): boolean {
    return this.showCurrentFileOnly
  }

  setCurrentFilePath(filePath: string | null): void {
    this.currentFilePath = filePath
    if (this.showCurrentFileOnly) {
      this.refresh()
    }
  }

  getCurrentFilePath(): string | null {
    return this.currentFilePath
  }

  getTreeItem(element: CommentTreeItem): TreeItem {
    return element
  }

  getChildren(element?: CommentTreeItem): ProviderResult<CommentTreeItem[]> {
    if (!element) {
      return this.getFileItems()
    }

    if (element instanceof FileItem) {
      return element.comments.map(c => new CommentItem(c))
    }

    return []
  }

  private getFileItems(): FileItem[] {
    const storage = getStorage()
    let comments = storage.getAll()

    if (this.categoryFilter) {
      comments = comments.filter(c => c.category === this.categoryFilter)
    }

    if (this.showCurrentFileOnly && this.currentFilePath) {
      comments = comments.filter(c => c.filePath === this.currentFilePath)
    }

    const commentsByFile = new Map<string, Comment[]>()
    for (const comment of comments) {
      const existing = commentsByFile.get(comment.filePath) || []
      existing.push(comment)
      commentsByFile.set(comment.filePath, existing)
    }

    const fileItems: FileItem[] = []
    for (const [filePath, fileComments] of commentsByFile) {
      const sortedComments = fileComments.sort((a, b) => a.startLine - b.startLine)
      fileItems.push(new FileItem(filePath, sortedComments))
    }

    return fileItems.sort((a, b) => a.filePath.localeCompare(b.filePath))
  }

  getFilteredCount(): number {
    const storage = getStorage()
    let comments = storage.getAll()
    if (this.categoryFilter) {
      comments = comments.filter(c => c.category === this.categoryFilter)
    }
    return comments.length
  }

  getTotalCount(): number {
    return getStorage().getAll().length
  }
}

let treeDataProvider: CommentTreeDataProvider | undefined

export function registerTreeView(): CommentTreeDataProvider {
  treeDataProvider = new CommentTreeDataProvider()
  window.registerTreeDataProvider('codeReviewComments', treeDataProvider)
  return treeDataProvider
}

export function getTreeDataProvider(): CommentTreeDataProvider | undefined {
  return treeDataProvider
}

export function refreshTreeView(): void {
  treeDataProvider?.refresh()
}
