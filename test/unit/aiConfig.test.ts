import { describe, expect, it } from 'vitest'
import { AI_TOOL_CONFIGS, getToolConfig, isToolConfigValid } from '../../src/aiConfig'
import { AI_TOOLS } from '../../src/aiTools'

describe('ai config', () => {
  describe('ai_tool_configs', () => {
    it('should have configuration for all AI tools', () => {
      expect(AI_TOOL_CONFIGS[AI_TOOLS.CLAUDE]).toBeDefined()
      expect(AI_TOOL_CONFIGS[AI_TOOLS.COPILOT]).toBeDefined()
      expect(AI_TOOL_CONFIGS[AI_TOOLS.OPENCODE]).toBeDefined()
      expect(AI_TOOL_CONFIGS[AI_TOOLS.AMP]).toBeDefined()
      expect(AI_TOOL_CONFIGS[AI_TOOLS.CUSTOM]).toBeDefined()
    })

    it('should have correct command templates', () => {
      expect(AI_TOOL_CONFIGS[AI_TOOLS.CLAUDE].command).toContain('claude')
      expect(AI_TOOL_CONFIGS[AI_TOOLS.COPILOT].command).toContain('copilot')
      expect(AI_TOOL_CONFIGS[AI_TOOLS.OPENCODE].command).toContain('opencode')
      expect(AI_TOOL_CONFIGS[AI_TOOLS.AMP].command).toContain('amp')
      expect(AI_TOOL_CONFIGS[AI_TOOLS.CUSTOM].command).toContain('{{customCommand}}')
    })

    it('should have correct model requirements', () => {
      expect(AI_TOOL_CONFIGS[AI_TOOLS.CLAUDE].requiresModel).toBe(true)
      expect(AI_TOOL_CONFIGS[AI_TOOLS.COPILOT].requiresModel).toBe(true)
      expect(AI_TOOL_CONFIGS[AI_TOOLS.OPENCODE].requiresModel).toBe(true)
      expect(AI_TOOL_CONFIGS[AI_TOOLS.AMP].requiresModel).toBe(true)
      expect(AI_TOOL_CONFIGS[AI_TOOLS.CUSTOM].requiresModel).toBe(false)
    })

    it('should have correct default models', () => {
      expect(AI_TOOL_CONFIGS[AI_TOOLS.CLAUDE].defaultModel).toBe('haiku')
      expect(AI_TOOL_CONFIGS[AI_TOOLS.COPILOT].defaultModel).toBe('gpt-4.1')
      expect(AI_TOOL_CONFIGS[AI_TOOLS.OPENCODE].defaultModel).toBe('opencode/big-pickle')
      expect(AI_TOOL_CONFIGS[AI_TOOLS.AMP].defaultModel).toBe('smart')
      expect(AI_TOOL_CONFIGS[AI_TOOLS.CUSTOM].defaultModel).toBe('')
    })

    it('should have correct security warnings', () => {
      expect(AI_TOOL_CONFIGS[AI_TOOLS.CLAUDE].securityWarning).toBe(false)
      expect(AI_TOOL_CONFIGS[AI_TOOLS.COPILOT].securityWarning).toBe(false)
      expect(AI_TOOL_CONFIGS[AI_TOOLS.OPENCODE].securityWarning).toBe(false)
      expect(AI_TOOL_CONFIGS[AI_TOOLS.AMP].securityWarning).toBe(false)
      expect(AI_TOOL_CONFIGS[AI_TOOLS.CUSTOM].securityWarning).toBe(true)
    })

    it('should have correct custom command requirements', () => {
      expect(AI_TOOL_CONFIGS[AI_TOOLS.CLAUDE].requiresCustomCommand).toBe(false)
      expect(AI_TOOL_CONFIGS[AI_TOOLS.COPILOT].requiresCustomCommand).toBe(false)
      expect(AI_TOOL_CONFIGS[AI_TOOLS.OPENCODE].requiresCustomCommand).toBe(false)
      expect(AI_TOOL_CONFIGS[AI_TOOLS.AMP].requiresCustomCommand).toBe(false)
      expect(AI_TOOL_CONFIGS[AI_TOOLS.CUSTOM].requiresCustomCommand).toBe(true)
    })
  })

  describe('getToolConfig', () => {
    it('should return correct config for each tool', () => {
      const claudeConfig = getToolConfig(AI_TOOLS.CLAUDE)
      expect(claudeConfig.command).toContain('claude')
      expect(claudeConfig.requiresModel).toBe(true)

      const customConfig = getToolConfig(AI_TOOLS.CUSTOM)
      expect(customConfig.securityWarning).toBe(true)
      expect(customConfig.requiresCustomCommand).toBe(true)
    })

    it('should throw error for unknown tool', () => {
      expect(() => getToolConfig('unknown' as any)).toThrow('Unknown AI tool: unknown')
    })
  })

  describe('isToolConfigValid', () => {
    it('should return true for tools with valid configuration', () => {
      expect(isToolConfigValid(AI_TOOLS.CLAUDE, '')).toBe(true)
      expect(isToolConfigValid(AI_TOOLS.COPILOT, '')).toBe(true)
      expect(isToolConfigValid(AI_TOOLS.OPENCODE, '')).toBe(true)
      expect(isToolConfigValid(AI_TOOLS.AMP, '')).toBe(true)
    })

    it('should return false for custom tool without custom command', () => {
      expect(isToolConfigValid(AI_TOOLS.CUSTOM, '')).toBe(false)
      expect(isToolConfigValid(AI_TOOLS.CUSTOM, '   ')).toBe(false)
    })

    it('should return true for custom tool with custom command', () => {
      expect(isToolConfigValid(AI_TOOLS.CUSTOM, 'ccs glm')).toBe(true)
      expect(isToolConfigValid(AI_TOOLS.CUSTOM, 'my-custom-tool')).toBe(true)
    })

    it('should handle null/undefined custom commands', () => {
      expect(isToolConfigValid(AI_TOOLS.CUSTOM, null as any)).toBe(false)
      expect(isToolConfigValid(AI_TOOLS.CUSTOM, undefined as any)).toBe(false)
    })
  })
})
