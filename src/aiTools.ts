export const AI_TOOLS = {
  CLAUDE: 'claude',
  OPENCODE: 'opencode',
  CUSTOM: 'custom',
} as const

export type AiToolType = typeof AI_TOOLS[keyof typeof AI_TOOLS]

export function isValidAiTool(value: string): value is AiToolType {
  return Object.values(AI_TOOLS).includes(value as AiToolType)
}

export function getAiToolDefaultModel(tool: AiToolType): string {
  switch (tool) {
    case AI_TOOLS.CLAUDE:
      return 'haiku'
    case AI_TOOLS.OPENCODE:
      return 'opencode/big-pickle'
    case AI_TOOLS.CUSTOM:
      return ''
    default:
      return ''
  }
}
