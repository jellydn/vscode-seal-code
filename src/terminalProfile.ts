import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

export type TerminalProfile = 'default' | 'tmux'

export async function isTmuxAvailable(): Promise<boolean> {
  try {
    await execAsync('which tmux')
    return true
  }
  catch {
    return false
  }
}

export function getSessionName(workspaceName: string): string {
  const sanitized = workspaceName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return `sealcode-${sanitized || 'workspace'}`
}
