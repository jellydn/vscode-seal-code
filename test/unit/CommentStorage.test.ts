import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as vscode from 'vscode'
import { CommentStorage } from '../../src/CommentStorage'
import { createComments } from '../fixtures/testData'
import { createEmptyWorkspace, createInvalidJsonContent, createMockCommentsFile, createMockWorkspace, MockFileSystem } from '../helpers/testUtils'

vi.mock('vscode', () => ({
  workspace: {
    workspaceFolders: [],
    fs: undefined,
  },
  window: {
    showErrorMessage: vi.fn(),
    showInformationMessage: vi.fn(),
  },
  Uri: {
    joinPath: (base: any, ...parts: string[]) => ({
      fsPath: `${base.fsPath}/${parts.join('/')}`,
      toString: () => `${base.fsPath}/${parts.join('/')}`,
    }),
  },
}))

vi.mock('node:crypto', () => ({
  randomUUID: () => `test-uuid-${Math.random().toString(36).substr(2, 9)}`,
}))

describe('commentStorage', () => {
  let mockFs: MockFileSystem
  let storage: CommentStorage
  let mockWorkspace: any

  beforeEach(() => {
    mockFs = new MockFileSystem()
    mockWorkspace = createMockWorkspace(mockFs)

    vi.mocked(vscode.workspace).workspaceFolders = mockWorkspace.workspaceFolders
    vi.mocked(vscode.workspace).fs = mockFs

    storage = new CommentStorage()
  })

  afterEach(() => {
    vi.clearAllMocks()
    mockFs.clear()
  })

  describe('load', () => {
    it('should load empty comments array when file does not exist', async () => {
      const comments = await storage.load()
      expect(comments).toEqual([])
    })

    it('should load comments from existing file', async () => {
      const expectedComments = createComments(3)
      mockFs.setFile('/test/workspace/.codereview/comments.json', createMockCommentsFile(expectedComments))

      const comments = await storage.load()
      expect(comments).toHaveLength(3)
      expect(comments[0].text).toBe('Test comment 1')
    })

    it('should handle invalid JSON gracefully', async () => {
      mockFs.setFile('/test/workspace/.codereview/comments.json', createInvalidJsonContent())

      const comments = await storage.load()
      expect(comments).toEqual([])
    })

    it('should return empty array when no workspace folder', async () => {
      vi.mocked(vscode.workspace).workspaceFolders = createEmptyWorkspace().workspaceFolders
      const emptyStorage = new CommentStorage()

      const comments = await emptyStorage.load()
      expect(comments).toEqual([])
    })
  })

  describe('add', () => {
    beforeEach(async () => {
      await storage.load()
    })

    it('should add a new comment', async () => {
      const comment = await storage.add(
        '/test/file.ts',
        5,
        10,
        'New comment',
        'bug',
      )

      expect(comment.id).toBeDefined()
      expect(comment.filePath).toBe('/test/file.ts')
      expect(comment.startLine).toBe(5)
      expect(comment.endLine).toBe(10)
      expect(comment.text).toBe('New comment')
      expect(comment.category).toBe('bug')
      expect(comment.createdAt).toBe(comment.updatedAt)
    })

    it('should generate unique IDs for each comment', async () => {
      const comment1 = await storage.add('/test/file.ts', 1, 1, 'Comment 1', 'suggestion')
      const comment2 = await storage.add('/test/file.ts', 2, 2, 'Comment 2', 'suggestion')

      expect(comment1.id).not.toBe(comment2.id)
    })

    it('should persist comment to storage', async () => {
      await storage.add('/test/file.ts', 1, 1, 'Test comment', 'suggestion')

      const allComments = storage.getAll()
      expect(allComments).toHaveLength(1)
      expect(allComments[0].text).toBe('Test comment')
    })
  })

  describe('update', () => {
    beforeEach(async () => {
      await storage.load()
      await storage.add('/test/file.ts', 1, 1, 'Original comment', 'suggestion')
    })

    it('should update existing comment', async () => {
      const comments = storage.getAll()
      const commentId = comments[0].id
      const originalCreatedAt = comments[0].createdAt

      // Add a small delay to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 2))

      const updated = await storage.update(commentId, {
        text: 'Updated comment',
        category: 'bug',
      })

      expect(updated).toBeDefined()
      if (updated) {
        expect(updated.text).toBe('Updated comment')
        expect(updated.category).toBe('bug')
        expect(updated.createdAt).toBe(originalCreatedAt)
        expect(updated.updatedAt).not.toBe(originalCreatedAt)
      }
    })

    it('should return undefined for non-existent comment', async () => {
      const result = await storage.update('non-existent-id', {
        text: 'Updated',
      })

      expect(result).toBeUndefined()
    })

    it('should allow partial updates', async () => {
      const comments = storage.getAll()
      const commentId = comments[0].id
      const originalCategory = comments[0].category

      const updated = await storage.update(commentId, {
        text: 'Updated text only',
      })

      expect(updated).toBeDefined()
      if (updated) {
        expect(updated.text).toBe('Updated text only')
        expect(updated.category).toBe(originalCategory)
      }
    })
  })

  describe('delete', () => {
    beforeEach(async () => {
      await storage.load()
      await storage.add('/test/file.ts', 1, 1, 'Comment to delete', 'suggestion')
    })

    it('should delete existing comment', async () => {
      const comments = storage.getAll()
      const commentId = comments[0].id

      const deleted = await storage.delete(commentId)

      expect(deleted).toBe(true)
      expect(storage.getAll()).toHaveLength(0)
    })

    it('should return false for non-existent comment', async () => {
      const deleted = await storage.delete('non-existent-id')
      expect(deleted).toBe(false)
    })
  })

  describe('getters', () => {
    beforeEach(async () => {
      await storage.load()
      await storage.add('/test/file1.ts', 1, 1, 'Comment 1', 'suggestion')
      await storage.add('/test/file2.ts', 2, 2, 'Comment 2', 'bug')
      await storage.add('/test/file1.ts', 3, 3, 'Comment 3', 'question')
    })

    it('getAll should return all comments', () => {
      const all = storage.getAll()
      expect(all).toHaveLength(3)
    })

    it('getById should return correct comment', () => {
      const all = storage.getAll()
      const firstComment = all[0]
      const found = storage.getById(firstComment.id)

      expect(found).toBe(firstComment)
    })

    it('getById should return undefined for non-existent comment', () => {
      const found = storage.getById('non-existent')
      expect(found).toBeUndefined()
    })

    it('getByFilePath should return comments for specific file', () => {
      const file1Comments = storage.getByFilePath('/test/file1.ts')
      expect(file1Comments).toHaveLength(2)

      const file2Comments = storage.getByFilePath('/test/file2.ts')
      expect(file2Comments).toHaveLength(1)
    })
  })

  describe('clearAll', () => {
    beforeEach(async () => {
      await storage.load()
      await storage.add('/test/file1.ts', 1, 1, 'Comment 1', 'suggestion')
      await storage.add('/test/file2.ts', 2, 2, 'Comment 2', 'bug')
    })

    it('should clear all comments and return count', async () => {
      const count = await storage.clearAll()

      expect(count).toBe(2)
      expect(storage.getAll()).toHaveLength(0)
    })
  })

  describe('updateFilePaths', () => {
    beforeEach(async () => {
      await storage.load()
      await storage.add('/test/old.ts', 1, 1, 'Comment 1', 'suggestion')
      await storage.add('/test/old.ts', 2, 2, 'Comment 2', 'bug')
      await storage.add('/test/other.ts', 3, 3, 'Comment 3', 'question')
    })

    it('should update file paths and return count', async () => {
      const updated = await storage.updateFilePaths('/test/old.ts', '/test/new.ts')

      expect(updated).toBe(2)

      const newFileComments = storage.getByFilePath('/test/new.ts')
      expect(newFileComments).toHaveLength(2)

      const oldFileComments = storage.getByFilePath('/test/old.ts')
      expect(oldFileComments).toHaveLength(0)
    })

    it('should return 0 when no comments match', async () => {
      const updated = await storage.updateFilePaths('/test/nonexistent.ts', '/test/new.ts')
      expect(updated).toBe(0)
    })
  })
})
