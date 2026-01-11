import { describe, expect, it } from 'vitest'
import {
  createComment,
  createCommentsWithDifferentCategories,
  createCommentsWithDifferentFiles,
  createMultiLineComments,
} from '../fixtures/testData'
import {
  filterComments,
  formatCommentDescription,
  formatCommentLabel,
  formatLineInfo,
  groupAndSortComments,
  truncateText,
} from '../helpers/filteringUtils'

describe('filtering Utilities', () => {
  describe('filterComments', () => {
    const baseComments = [
      createComment({ id: '1', filePath: 'src/file1.ts', category: 'bug', startLine: 1 }),
      createComment({ id: '2', filePath: 'src/file1.ts', category: 'suggestion', startLine: 2 }),
      createComment({ id: '3', filePath: 'src/file2.ts', category: 'bug', startLine: 3 }),
    ]

    it('should return all comments when no filters applied', () => {
      const result = filterComments(baseComments)
      expect(result).toHaveLength(3)
    })

    it('should filter by category', () => {
      const result = filterComments(baseComments, 'bug')
      expect(result).toHaveLength(2)
      expect(result.every(c => c.category === 'bug')).toBe(true)
    })

    it('should filter by current file only', () => {
      const result = filterComments(baseComments, undefined, 'src/file1.ts', undefined, true)
      expect(result).toHaveLength(2)
      expect(result.every(c => c.filePath === 'src/file1.ts')).toBe(true)
    })

    it('should filter by filename', () => {
      const result = filterComments(baseComments, undefined, undefined, 'src/file2.ts')
      expect(result).toHaveLength(1)
      expect(result[0].filePath).toBe('src/file2.ts')
    })

    it('should apply multiple filters together', () => {
      const result = filterComments(baseComments, 'bug', 'src/file1.ts', undefined, true)
      expect(result).toHaveLength(1)
      expect(result[0].category).toBe('bug')
      expect(result[0].filePath).toBe('src/file1.ts')
    })

    it('should return empty array when no comments match filters', () => {
      const result = filterComments(baseComments, 'note')
      expect(result).toHaveLength(0)
    })

    it('should handle empty comments array', () => {
      const result = filterComments([])
      expect(result).toHaveLength(0)
    })
  })

  describe('groupAndSortComments', () => {
    it('should group comments by file and sort by line number', () => {
      const comments = [
        createComment({ id: '1', filePath: 'src/file1.ts', startLine: 3 }),
        createComment({ id: '2', filePath: 'src/file2.ts', startLine: 1 }),
        createComment({ id: '3', filePath: 'src/file1.ts', startLine: 1 }),
      ]

      const result = groupAndSortComments(comments)

      expect(result).toHaveLength(2)

      // File paths should be sorted alphabetically
      expect(result[0].filePath).toBe('src/file1.ts')
      expect(result[1].filePath).toBe('src/file2.ts')

      // Comments within each file should be sorted by line number
      expect(result[0].comments).toHaveLength(2)
      expect(result[0].comments[0].startLine).toBe(1)
      expect(result[0].comments[1].startLine).toBe(3)
    })

    it('should handle empty comments array', () => {
      const result = groupAndSortComments([])
      expect(result).toHaveLength(0)
    })

    it('should handle single file with multiple comments', () => {
      const comments = [
        createComment({ filePath: 'src/only.ts', startLine: 5 }),
        createComment({ filePath: 'src/only.ts', startLine: 2 }),
        createComment({ filePath: 'src/only.ts', startLine: 8 }),
      ]

      const result = groupAndSortComments(comments)

      expect(result).toHaveLength(1)
      expect(result[0].filePath).toBe('src/only.ts')
      expect(result[0].comments.map(c => c.startLine)).toEqual([2, 5, 8])
    })
  })

  describe('truncateText', () => {
    it('should return text unchanged when shorter than max length', () => {
      const result = truncateText('short text', 20)
      expect(result).toBe('short text')
    })

    it('should return text unchanged when equal to max length', () => {
      const result = truncateText('exactly twenty chars', 20)
      expect(result).toBe('exactly twenty chars')
    })

    it('should truncate text longer than max length', () => {
      const result = truncateText('this is a very long text that needs truncation', 20)
      expect(result).toBe('this is a very lo...')
      expect(result.length).toBe(20)
    })

    it('should handle empty string', () => {
      const result = truncateText('', 10)
      expect(result).toBe('')
    })

    it('should handle zero max length', () => {
      const result = truncateText('any text', 0)
      expect(result).toBe('...')
    })
  })

  describe('formatCommentLabel', () => {
    it('should format comment text without newlines', () => {
      const comment = createComment({ text: 'Simple comment' })
      const result = formatCommentLabel(comment)
      expect(result).toBe('Simple comment')
    })

    it('should replace newlines with spaces', () => {
      const comment = createComment({ text: 'Multi\nline\ncomment' })
      const result = formatCommentLabel(comment)
      expect(result).toBe('Multi line comment')
    })

    it('should truncate long comments', () => {
      const longText = 'This is a very long comment that should be truncated'
      const comment = createComment({ text: longText })
      const result = formatCommentLabel(comment, 20)
      expect(result).toBe('This is a very lo...')
    })

    it('should handle custom max length', () => {
      const comment = createComment({ text: 'Some text' })
      const result = formatCommentLabel(comment, 5)
      expect(result).toBe('So...')
    })
  })

  describe('formatLineInfo', () => {
    it('should format single line', () => {
      const result = formatLineInfo(10, 10)
      expect(result).toBe('L10')
    })

    it('should format line range', () => {
      const result = formatLineInfo(5, 10)
      expect(result).toBe('L5-10')
    })

    it('should handle same start and end line', () => {
      const result = formatLineInfo(1, 1)
      expect(result).toBe('L1')
    })
  })

  describe('formatCommentDescription', () => {
    it('should format description for single line comment', () => {
      const comment = createComment({ category: 'bug', startLine: 5, endLine: 5 })
      const result = formatCommentDescription(comment)
      expect(result).toBe('bug L5')
    })

    it('should format description for multi-line comment', () => {
      const comment = createComment({ category: 'suggestion', startLine: 3, endLine: 7 })
      const result = formatCommentDescription(comment)
      expect(result).toBe('suggestion L3-7')
    })
  })

  describe('integration with different comment types', () => {
    it('should work with comments of different categories', () => {
      const comments = createCommentsWithDifferentCategories()
      const filtered = filterComments(comments, 'suggestion')
      expect(filtered).toHaveLength(1)
      expect(filtered[0].category).toBe('suggestion')
    })

    it('should work with comments from different files', () => {
      const comments = createCommentsWithDifferentFiles()
      const grouped = groupAndSortComments(comments)
      expect(grouped).toHaveLength(2)
      expect(grouped.map(g => g.filePath)).toContain('src/file1.ts')
      expect(grouped.map(g => g.filePath)).toContain('src/file2.ts')
    })

    it('should work with multi-line comments', () => {
      const comments = createMultiLineComments()
      const labels = comments.map(c => formatCommentLabel(c))
      expect(labels).toContain('Multi-line comment')
      expect(labels).toContain('Another multi-line')
      expect(labels).toContain('Single line')
    })
  })
})
