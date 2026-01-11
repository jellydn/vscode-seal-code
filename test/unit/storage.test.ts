import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as vscode from 'vscode'
import * as storage from '../../src/storage'
import { createEmptyWorkspace, createMockWorkspace, MockFileSystem } from '../helpers/testUtils'

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

describe('storage utilities', () => {
  let mockFs: MockFileSystem
  let mockWorkspace: any

  beforeEach(() => {
    mockFs = new MockFileSystem()
    mockWorkspace = createMockWorkspace(mockFs)

    vi.mocked(vscode.workspace).workspaceFolders = mockWorkspace.workspaceFolders
    vi.mocked(vscode.workspace).fs = mockFs
    vi.mocked(vscode.window.showErrorMessage).mockClear()
    vi.mocked(vscode.window.showInformationMessage).mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
    mockFs.clear()
  })

  describe('getCodeReviewDir', () => {
    it('should return codereview directory path when workspace exists', async () => {
      vi.mocked(vscode.workspace).workspaceFolders = mockWorkspace.workspaceFolders

      const result = await storage.getCodeReviewDir()

      expect(result?.toString()).toBe('/test/workspace/.codereview')
    })

    it('should return undefined when no workspace folder', async () => {
      vi.mocked(vscode.workspace).workspaceFolders = createEmptyWorkspace().workspaceFolders

      const result = await storage.getCodeReviewDir()

      expect(result).toBeUndefined()
    })
  })

  describe('getCommentsFilePath', () => {
    it('should return comments file path when workspace exists', async () => {
      vi.mocked(vscode.workspace).workspaceFolders = mockWorkspace.workspaceFolders

      const result = await storage.getCommentsFilePath()

      expect(result?.toString()).toBe('/test/workspace/.codereview/comments.json')
    })

    it('should return undefined when no workspace folder', async () => {
      vi.mocked(vscode.workspace).workspaceFolders = createEmptyWorkspace().workspaceFolders

      const result = await storage.getCommentsFilePath()

      expect(result).toBeUndefined()
    })
  })

  describe('ensureCodeReviewDir', () => {
    it('should create directory when it does not exist', async () => {
      vi.mocked(vscode.workspace).workspaceFolders = mockWorkspace.workspaceFolders
      vi.mocked(vscode.window.showInformationMessage).mockResolvedValue('No' as any)

      const result = await storage.ensureCodeReviewDir()

      expect(result?.toString()).toBe('/test/workspace/.codereview')
      expect(mockFs.directoryExists('/test/workspace/.codereview')).toBe(true)
    })

    it('should not create directory when it already exists', async () => {
      await mockFs.createDirectory('/test/workspace/.codereview')
      vi.mocked(vscode.workspace).workspaceFolders = mockWorkspace.workspaceFolders

      const result = await storage.ensureCodeReviewDir()

      expect(result?.toString()).toBe('/test/workspace/.codereview')
    })

    it('should show error message when no workspace folder', async () => {
      vi.mocked(vscode.workspace).workspaceFolders = createEmptyWorkspace().workspaceFolders

      const result = await storage.ensureCodeReviewDir()

      expect(result).toBeUndefined()
      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('No workspace folder found')
    })

    it('should prompt to add to gitignore when creating directory', async () => {
      vi.mocked(vscode.workspace).workspaceFolders = mockWorkspace.workspaceFolders
      vi.mocked(vscode.window.showInformationMessage).mockResolvedValue('Yes' as any)

      await storage.ensureCodeReviewDir()

      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
        'Add .codereview/ to .gitignore?',
        'Yes',
        'No',
      )
    })
  })

  describe('ensureCommentsFile', () => {
    it('should create file with empty array when it does not exist', async () => {
      vi.mocked(vscode.workspace).workspaceFolders = mockWorkspace.workspaceFolders
      vi.mocked(vscode.window.showInformationMessage).mockResolvedValue('No' as any)

      const result = await storage.ensureCommentsFile()

      expect(result?.toString()).toBe('/test/workspace/.codereview/comments.json')
      expect(mockFs.fileExists('/test/workspace/.codereview/comments.json')).toBe(true)

      const content = mockFs.getFile('/test/workspace/.codereview/comments.json')
      expect(content).toBe('[]')
    })

    it('should not create file when it already exists', async () => {
      await mockFs.createDirectory('/test/workspace/.codereview')
      mockFs.setFile('/test/workspace/.codereview/comments.json', '[{"existing": true}]')
      vi.mocked(vscode.workspace).workspaceFolders = mockWorkspace.workspaceFolders

      const result = await storage.ensureCommentsFile()

      expect(result?.toString()).toBe('/test/workspace/.codereview/comments.json')

      const content = mockFs.getFile('/test/workspace/.codereview/comments.json')
      expect(content).toBe('[{"existing": true}]')
    })
  })

  describe('promptAddToGitignore integration', () => {
    it('should add codereview to gitignore when user says yes', async () => {
      vi.mocked(vscode.workspace).workspaceFolders = mockWorkspace.workspaceFolders
      vi.mocked(vscode.window.showInformationMessage).mockResolvedValue('Yes' as any)

      await storage.ensureCodeReviewDir()

      const gitignoreContent = mockFs.getFile('/test/workspace/.gitignore')
      expect(gitignoreContent).toContain('.codereview/')
    })

    it('should not add codereview to gitignore when user says no', async () => {
      vi.mocked(vscode.workspace).workspaceFolders = mockWorkspace.workspaceFolders
      vi.mocked(vscode.window.showInformationMessage).mockResolvedValue('No' as any)

      await storage.ensureCodeReviewDir()

      const gitignoreContent = mockFs.getFile('/test/workspace/.gitignore')
      expect(gitignoreContent).toBeUndefined()
    })

    it('should not duplicate entry if already in gitignore', async () => {
      mockFs.setFile('/test/workspace/.gitignore', 'existing\n.codereview/\nanother')
      vi.mocked(vscode.workspace).workspaceFolders = mockWorkspace.workspaceFolders
      vi.mocked(vscode.window.showInformationMessage).mockResolvedValue('Yes' as any)

      await storage.ensureCodeReviewDir()

      const gitignoreContent = mockFs.getFile('/test/workspace/.gitignore')
      expect(gitignoreContent).toBe('existing\n.codereview/\nanother')
    })

    it('should create gitignore if it does not exist', async () => {
      vi.mocked(vscode.workspace).workspaceFolders = mockWorkspace.workspaceFolders
      vi.mocked(vscode.window.showInformationMessage).mockResolvedValue('Yes' as any)

      await storage.ensureCodeReviewDir()

      expect(mockFs.fileExists('/test/workspace/.gitignore')).toBe(true)

      const gitignoreContent = mockFs.getFile('/test/workspace/.gitignore')
      expect(gitignoreContent).toBe('.codereview/\n')
    })
  })
})
