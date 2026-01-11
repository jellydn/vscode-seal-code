import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildCommand, getEffectiveModel } from '../../src/commandBuilder'

const mockGetToolConfig = vi.hoisted(() => vi.fn())
vi.mock('../../src/aiConfig', () => ({
  getToolConfig: mockGetToolConfig,
}))

const mockGetAiToolDefaultModel = vi.hoisted(() => vi.fn())
vi.mock('../../src/aiTools', async (importOriginal) => {
  const mod = await importOriginal() as any
  return {
    ...mod,
    getAiToolDefaultModel: mockGetAiToolDefaultModel,
  }
})

describe('commandBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('escapeDoubleQuotes', () => {
    it('should escape double quotes in string', () => {
      mockGetToolConfig.mockReturnValue({
        command: 'tool --prompt "{{prompt}}"',
      })

      const result = buildCommand('opencode', 'Say "hello"', 'model')

      expect(result).toContain('Say \\"hello\\"')
    })

    it('should handle strings without quotes', () => {
      mockGetToolConfig.mockReturnValue({
        command: 'tool --prompt "{{prompt}}"',
      })

      const result = buildCommand('opencode', 'simple text', 'model')

      expect(result).toContain('simple text')
    })
  })

  describe('interpolateValues', () => {
    it('should replace all placeholders correctly', () => {
      mockGetToolConfig.mockReturnValue({
        command: '{{customCommand}} --model {{model}} --prompt "{{prompt}}"',
      })

      const result = buildCommand('custom', 'test prompt', 'test-model', 'custom-tool')

      expect(result).toBe('custom-tool --model test-model --prompt "test prompt"')
    })

    it('should handle multiple occurrences of same placeholder', () => {
      mockGetToolConfig.mockReturnValue({
        command: '{{prompt}} and {{prompt}} again',
      })

      const result = buildCommand('opencode', 'test', 'model')

      expect(result).toBe('test and test again')
    })
  })

  describe('buildCommand', () => {
    beforeEach(() => {
      mockGetToolConfig.mockReturnValue({
        command: 'opencode --model {{model}} --prompt "{{prompt}}"',
      })
    })

    it('should throw error for empty prompt', () => {
      expect(() => buildCommand('opencode', '')).toThrow('Prompt is required and must be a non-empty string')
      expect(() => buildCommand('opencode', '   ')).toThrow('Prompt is required and must be a non-empty string')
    })

    it('should throw error for non-string prompt', () => {
      expect(() => buildCommand('opencode', null as any)).toThrow('Prompt is required and must be a non-empty string')
      expect(() => buildCommand('opencode', undefined as any)).toThrow('Prompt is required and must be a non-empty string')
    })

    it('should build command with all parameters', () => {
      const result = buildCommand('opencode', 'test prompt', 'test-model', 'custom-command')

      expect(result).toBe('opencode --model test-model --prompt "test prompt"')
    })

    it('should build command with default values', () => {
      const result = buildCommand('opencode', 'test prompt')

      expect(result).toBe('opencode --model  --prompt "test prompt"')
    })

    it('should handle prompt with special characters', () => {
      mockGetToolConfig.mockReturnValue({
        command: 'opencode --model {{model}} --prompt "{{prompt}}"',
      })

      const result = buildCommand('opencode', 'Test with "quotes" and \n newlines', 'model')

      expect(result).toBe('opencode --model model --prompt "Test with \\"quotes\\" and \n newlines"')
    })
  })

  describe('getEffectiveModel', () => {
    beforeEach(() => {
      mockGetAiToolDefaultModel.mockReturnValue('default-model')
    })

    it('should return configured model when provided', () => {
      const result = getEffectiveModel('claude', 'sonnet')

      expect(result).toBe('sonnet')
      expect(mockGetAiToolDefaultModel).not.toHaveBeenCalled()
    })

    it('should return default model when configured model is empty', () => {
      const result = getEffectiveModel('claude', '')

      expect(result).toBe('default-model')
      expect(mockGetAiToolDefaultModel).toHaveBeenCalledWith('claude')
    })

    it('should return default model when configured model is whitespace only', () => {
      const result = getEffectiveModel('claude', '   ')

      expect(result).toBe('default-model')
      expect(mockGetAiToolDefaultModel).toHaveBeenCalledWith('claude')
    })

    it('should return default model when configured model is null/undefined', () => {
      expect(getEffectiveModel('claude', null as any)).toBe('default-model')
      expect(getEffectiveModel('claude', undefined as any)).toBe('default-model')
      expect(mockGetAiToolDefaultModel).toHaveBeenCalledTimes(2)
    })

    it('should handle non-string configured model', () => {
      const result = getEffectiveModel('claude', null as any)

      expect(result).toBe('default-model')
      expect(mockGetAiToolDefaultModel).toHaveBeenCalledWith('claude')
    })
  })

  describe('tool-specific command building', () => {
    it('should handle different tool configurations', () => {
      mockGetToolConfig
        .mockReturnValueOnce({ command: 'claude --model {{model}} "{{prompt}}"' })
        .mockReturnValueOnce({ command: 'copilot --model {{model}} --message "{{prompt}}"' })
        .mockReturnValueOnce({ command: '{{customCommand}} "{{prompt}}"' })

      const claudeCommand = buildCommand('claude', 'test', 'haiku')
      const copilotCommand = buildCommand('copilot', 'test', 'gpt-4')
      const customCommand = buildCommand('custom', 'test', '', 'ccs glm')

      expect(claudeCommand).toBe('claude --model haiku "test"')
      expect(copilotCommand).toBe('copilot --model gpt-4 --message "test"')
      expect(customCommand).toBe('ccs glm "test"')
    })
  })
})
