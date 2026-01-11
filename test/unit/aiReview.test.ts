import { beforeEach, describe, expect, it, vi } from 'vitest'
import { formatCommentsForAI } from '../../src/aiReview'
import { createCommentsWithDifferentCategories, createCommentsWithDifferentFiles, createMultiLineComments } from '../fixtures/testData'

vi.mock('vscode', () => ({
  window: {
    showErrorMessage: vi.fn(),
    showWarningMessage: vi.fn(),
    showInformationMessage: vi.fn(),
  },
  workspace: {
    getConfiguration: vi.fn(() => ({
      get: vi.fn(),
    })),
  },
}))

vi.mock('../../src/aiConfig', () => ({
  getToolConfig: vi.fn(() => ({ command: 'tool "{{prompt}}"' })),
  isToolConfigValid: vi.fn(() => true),
}))

vi.mock('../../src/generated/meta', () => ({
  configs: {
    aiToolClaudeModel: { key: 'claudeModel', default: 'haiku' },
    aiToolCopilotModel: { key: 'copilotModel', default: 'gpt-4.1' },
    aiToolOpenCodeModel: { key: 'openCodeModel', default: 'opencode/big-pickle' },
    aiToolAmpModel: { key: 'ampModel', default: 'smart' },
  },
}))

describe('formatCommentsForAI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should format single line comments correctly', () => {
    const comments = [
      {
        id: 'test-1',
        filePath: 'src/example.ts',
        startLine: 10,
        endLine: 10,
        text: 'This is a test comment',
        category: 'suggestion' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ]

    const result = formatCommentsForAI(comments)

    expect(result.formattedComments).toBe('[suggestion] src/example.ts:10 - This is a test comment')
    expect(result.files).toEqual(['src/example.ts'])
  })

  it('should format multi-line comments with line range', () => {
    const comments = createMultiLineComments()

    const result = formatCommentsForAI(comments)

    expect(result.formattedComments).toContain('[suggestion] /test/path/file.ts:1-3 - Multi-line comment')
    expect(result.formattedComments).toContain('[suggestion] /test/path/file.ts:10-15 - Another multi-line')
    expect(result.formattedComments).toContain('[suggestion] /test/path/file.ts:20 - Single line')
  })

  it('should group comments by file', () => {
    const comments = createCommentsWithDifferentFiles()

    const result = formatCommentsForAI(comments)

    expect(result.files).toHaveLength(2)
    expect(result.files).toContain('src/file1.ts')
    expect(result.files).toContain('src/file2.ts')
  })

  it('should format comments with different categories', () => {
    const comments = createCommentsWithDifferentCategories()

    const result = formatCommentsForAI(comments)

    expect(result.formattedComments).toContain('[bug] /test/path/file.ts:1 - bug comment')
    expect(result.formattedComments).toContain('[question] /test/path/file.ts:2 - question comment')
    expect(result.formattedComments).toContain('[suggestion] /test/path/file.ts:3 - suggestion comment')
    expect(result.formattedComments).toContain('[nitpick] /test/path/file.ts:4 - nitpick comment')
    expect(result.formattedComments).toContain('[note] /test/path/file.ts:5 - note comment')
  })

  it('should handle empty comments array', () => {
    const result = formatCommentsForAI([])

    expect(result.formattedComments).toBe('')
    expect(result.files).toEqual([])
  })

  it('should handle multiple comments in same file', () => {
    const comments = [
      {
        id: 'test-1',
        filePath: 'src/example.ts',
        startLine: 5,
        endLine: 5,
        text: 'First comment',
        category: 'suggestion' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: 'test-2',
        filePath: 'src/example.ts',
        startLine: 10,
        endLine: 15,
        text: 'Second comment',
        category: 'bug' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ]

    const result = formatCommentsForAI(comments)

    expect(result.files).toEqual(['src/example.ts'])
    expect(result.formattedComments).toContain('[suggestion] src/example.ts:5 - First comment')
    expect(result.formattedComments).toContain('[bug] src/example.ts:10-15 - Second comment')
  })

  it('should preserve file order', () => {
    const comments = [
      {
        id: 'test-1',
        filePath: 'src/z.ts',
        startLine: 1,
        endLine: 1,
        text: 'Z file comment',
        category: 'suggestion' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: 'test-2',
        filePath: 'src/a.ts',
        startLine: 1,
        endLine: 1,
        text: 'A file comment',
        category: 'bug' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ]

    const result = formatCommentsForAI(comments)

    expect(result.files).toEqual(['src/z.ts', 'src/a.ts'])
    expect(result.formattedComments).toBe('[suggestion] src/z.ts:1 - Z file comment\n[bug] src/a.ts:1 - A file comment')
  })
})
