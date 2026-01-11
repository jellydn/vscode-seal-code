import type { AiToolType } from './aiTools'
import { AI_TOOLS } from './aiTools'

export interface AiToolConfig {
  command: string
  requiresModel: boolean
  defaultModel: string
  securityWarning: boolean
  requiresCustomCommand: boolean
}

export const AI_TOOL_CONFIGS: Record<AiToolType, AiToolConfig> = {
  [AI_TOOLS.CLAUDE]: {
    command: 'claude --print --model {{model}} --permission-mode plan "{{prompt}}"',
    requiresModel: true,
    defaultModel: 'haiku',
    securityWarning: false,
    requiresCustomCommand: false,
  },
  [AI_TOOLS.OPENCODE]: {
    command: 'opencode run --model {{model}} "{{prompt}}"',
    requiresModel: true,
    defaultModel: 'opencode/big-pickle',
    securityWarning: false,
    requiresCustomCommand: false,
  },
  [AI_TOOLS.CUSTOM]: {
    command: '{{customCommand}} "{{prompt}}"',
    requiresModel: false,
    defaultModel: '',
    securityWarning: true,
    requiresCustomCommand: true,
  },
}

export function getToolConfig(tool: AiToolType): AiToolConfig {
  const config = AI_TOOL_CONFIGS[tool]
  if (!config) {
    throw new Error(`Unknown AI tool: ${tool}`)
  }
  return config
}

export function isToolConfigValid(tool: AiToolType, customCommand: string): boolean {
  const config = getToolConfig(tool)

  if (config.requiresCustomCommand && !customCommand) {
    return false
  }

  return true
}
