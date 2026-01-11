import { describe, expect, it } from 'vitest'
import { AI_TOOLS, getAiToolDefaultModel, isValidAiTool } from '../../src/aiTools'

describe('ai tools', () => {
  describe('ai_tools_constants', () => {
    it('should have all required tool constants', () => {
      expect(AI_TOOLS.CLAUDE).toBe('claude')
      expect(AI_TOOLS.COPILOT).toBe('copilot')
      expect(AI_TOOLS.OPENCODE).toBe('opencode')
      expect(AI_TOOLS.AMP).toBe('amp')
      expect(AI_TOOLS.CUSTOM).toBe('custom')
    })
  })

  describe('isValidAiTool', () => {
    it('should return true for valid AI tools', () => {
      expect(isValidAiTool('claude')).toBe(true)
      expect(isValidAiTool('copilot')).toBe(true)
      expect(isValidAiTool('opencode')).toBe(true)
      expect(isValidAiTool('amp')).toBe(true)
      expect(isValidAiTool('custom')).toBe(true)
    })

    it('should return false for invalid AI tools', () => {
      expect(isValidAiTool('invalid')).toBe(false)
      expect(isValidAiTool('')).toBe(false)
      expect(isValidAiTool('CLAUDE')).toBe(false)
      expect(isValidAiTool('claude ')).toBe(false)
    })
  })

  describe('getAiToolDefaultModel', () => {
    it('should return correct default models for each tool', () => {
      expect(getAiToolDefaultModel(AI_TOOLS.CLAUDE)).toBe('haiku')
      expect(getAiToolDefaultModel(AI_TOOLS.COPILOT)).toBe('gpt-4.1')
      expect(getAiToolDefaultModel(AI_TOOLS.OPENCODE)).toBe('opencode/big-pickle')
      expect(getAiToolDefaultModel(AI_TOOLS.AMP)).toBe('smart')
      expect(getAiToolDefaultModel(AI_TOOLS.CUSTOM)).toBe('')
    })

    it('should handle unknown tool gracefully', () => {
      const result = getAiToolDefaultModel('unknown' as any)
      expect(result).toBe('')
    })
  })
})
