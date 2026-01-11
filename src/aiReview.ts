import type { AiToolType } from './aiTools'
import type { Comment } from './types'
import { window, workspace } from 'vscode'
import { getToolConfig, isToolConfigValid } from './aiConfig'
import { AI_TOOLS, isValidAiTool } from './aiTools'
import { buildCommand, getEffectiveModel } from './commandBuilder'
import { configs } from './generated/meta'

export interface FormattedCommentsResult {
  formattedComments: string
  files: string[]
}

export function formatCommentsForAI(comments: Comment[]): FormattedCommentsResult {
  const commentsByFile = new Map<string, Comment[]>()

  for (const comment of comments) {
    const existing = commentsByFile.get(comment.filePath) || []
    existing.push(comment)
    commentsByFile.set(comment.filePath, existing)
  }

  const lines: string[] = []
  const files: string[] = []

  for (const [filePath, fileComments] of commentsByFile) {
    files.push(filePath)
    for (const comment of fileComments) {
      const lineRange = comment.startLine === comment.endLine
        ? `${comment.startLine}`
        : `${comment.startLine}-${comment.endLine}`
      lines.push(`[${comment.category}] ${filePath}:${lineRange} - ${comment.text}`)
    }
  }

  return {
    formattedComments: lines.join('\n'),
    files,
  }
}

export function buildAICommand(tool: string, customCommand: string, prompt: string): string {
  if (!isValidAiTool(tool)) {
    window.showErrorMessage(`Invalid AI tool: ${tool}. Using opencode as fallback.`)
    tool = AI_TOOLS.OPENCODE
  }

  const aiTool = tool as AiToolType

  if (!isToolConfigValid(aiTool, customCommand)) {
    window.showWarningMessage(
      'Custom AI tool command is empty. Using opencode as fallback.',
    )
    const fallbackConfig = workspace.getConfiguration()
    const fallbackModel = fallbackConfig.get<string>(configs.aiToolOpenCodeModel.key, configs.aiToolOpenCodeModel.default)
    return buildCommand(AI_TOOLS.OPENCODE, prompt, fallbackModel)
  }

  const toolConfig = getToolConfig(aiTool)

  if (toolConfig.securityWarning) {
    window.showInformationMessage(
      'Security Note: Using custom AI command. Ensure command is trusted and safe.',
      'I Understand',
    )
  }

  const config = workspace.getConfiguration()
  let configuredModel: string
  switch (aiTool) {
    case AI_TOOLS.CLAUDE:
      configuredModel = config.get<string>(configs.aiToolClaudeModel.key, configs.aiToolClaudeModel.default)
      break
    case AI_TOOLS.COPILOT:
      configuredModel = config.get<string>(configs.aiToolCopilotModel.key, configs.aiToolCopilotModel.default)
      break
    case AI_TOOLS.OPENCODE:
      configuredModel = config.get<string>(configs.aiToolOpenCodeModel.key, configs.aiToolOpenCodeModel.default)
      break
    default:
      configuredModel = ''
  }
  const model = getEffectiveModel(aiTool, configuredModel)

  return buildCommand(aiTool, prompt, model, customCommand)
}
