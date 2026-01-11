import type { AiToolType } from './aiTools'
import { getToolConfig, isToolConfigValid } from './aiConfig'
import { AI_TOOLS, getAiToolDefaultModel } from './aiTools'

function escapeDoubleQuotes(str: string): string {
  return str.replace(/"/g, '\\"')
}

function interpolateValues(prompt: string, model: string, customCommand: string, template: string): string {
  const escapedPrompt = escapeDoubleQuotes(prompt)

  return template
    .replace(/\{\{prompt\}\}/g, escapedPrompt)
    .replace(/\{\{model\}\}/g, model)
    .replace(/\{\{customCommand\}\}/g, customCommand)
}

export function createCommandBuilder(tool: AiToolType) {
  return (prompt: string, model?: string, customCommand?: string): string => {
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new Error('Prompt is required and must be a non-empty string')
    }

    const config = getToolConfig(tool)
    return interpolateValues(prompt, model || '', customCommand || '', config.command)
  }
}

export function buildCommand(
  tool: AiToolType,
  prompt: string,
  model?: string,
  customCommand?: string,
): string {
  const builder = createCommandBuilder(tool)
  return builder(prompt, model, customCommand)
}

export function buildCommandWithFallback(
  tool: AiToolType,
  prompt: string,
  fallbackTool: AiToolType = AI_TOOLS.OPENCODE,
  model?: string,
  customCommand?: string,
): { command: string, usedFallback: boolean } {
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new Error('Prompt is required and must be a non-empty string')
  }

  const finalModel = model || ''
  const finalCustomCommand = customCommand || ''

  if (isToolConfigValid(tool, finalCustomCommand)) {
    const config = getToolConfig(tool)
    return {
      command: interpolateValues(prompt, finalModel, finalCustomCommand, config.command),
      usedFallback: false,
    }
  }

  const fallbackConfig = getToolConfig(fallbackTool)
  return {
    command: interpolateValues(prompt, finalModel, finalCustomCommand, fallbackConfig.command),
    usedFallback: true,
  }
}

export function getEffectiveModel(tool: AiToolType, configuredModel: string): string {
  if (configuredModel?.trim()) {
    return configuredModel
  }
  return getAiToolDefaultModel(tool)
}
