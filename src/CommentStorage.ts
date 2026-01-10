import type { Comment, CommentCategory } from './types'
import { workspace } from 'vscode'
import { ensureCommentsFile, getCommentsFilePath } from './storage'

export class CommentStorage {
  private comments: Comment[] = []

  async load(): Promise<Comment[]> {
    const filePath = await getCommentsFilePath()
    if (!filePath) {
      return []
    }

    try {
      const content = await workspace.fs.readFile(filePath)
      this.comments = JSON.parse(new TextDecoder().decode(content)) as Comment[]
    }
    catch {
      this.comments = []
    }

    return this.comments
  }

  async save(): Promise<void> {
    const filePath = await ensureCommentsFile()
    if (!filePath) {
      return
    }

    const content = JSON.stringify(this.comments, null, 2)
    await workspace.fs.writeFile(filePath, new TextEncoder().encode(content))
  }

  async add(
    filePath: string,
    startLine: number,
    endLine: number,
    text: string,
    category: CommentCategory,
  ): Promise<Comment> {
    const now = new Date().toISOString()
    const comment: Comment = {
      id: crypto.randomUUID(),
      filePath,
      startLine,
      endLine,
      text,
      category,
      createdAt: now,
      updatedAt: now,
    }

    this.comments.push(comment)
    await this.save()
    return comment
  }

  async update(id: string, updates: Partial<Pick<Comment, 'text' | 'category'>>): Promise<Comment | undefined> {
    const index = this.comments.findIndex(c => c.id === id)
    if (index === -1) {
      return undefined
    }

    this.comments[index] = {
      ...this.comments[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await this.save()
    return this.comments[index]
  }

  async delete(id: string): Promise<boolean> {
    const index = this.comments.findIndex(c => c.id === id)
    if (index === -1) {
      return false
    }

    this.comments.splice(index, 1)
    await this.save()
    return true
  }

  getAll(): Comment[] {
    return this.comments
  }

  getById(id: string): Comment | undefined {
    return this.comments.find(c => c.id === id)
  }

  getByFilePath(filePath: string): Comment[] {
    return this.comments.filter(c => c.filePath === filePath)
  }

  async clearAll(): Promise<number> {
    const count = this.comments.length
    this.comments = []
    await this.save()
    return count
  }

  async updateFilePaths(oldPath: string, newPath: string): Promise<number> {
    let updated = 0
    for (const comment of this.comments) {
      if (comment.filePath === oldPath) {
        comment.filePath = newPath
        updated++
      }
    }
    if (updated > 0) {
      await this.save()
    }
    return updated
  }
}
