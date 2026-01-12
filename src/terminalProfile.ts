import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { window } from 'vscode'

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

export function buildTmuxCommand(sessionName: string, windowName: string, command: string): string {
  const escapedCommand = command.replace(/'/g, `'\\''`)
  return `tmux new-session -A -s ${sessionName} -n ${windowName} -d && tmux send-keys -t ${sessionName}:${windowName} '${escapedCommand}' Enter && tmux attach -t ${sessionName}`
}

export async function promptForFallback(): Promise<TerminalProfile | undefined> {
  const selection = await window.showQuickPick(
    [
      { label: 'Use Default Terminal', value: 'default' as const },
      { label: 'Cancel', value: undefined },
    ],
    {
      placeHolder: 'tmux is not available. Choose an alternative:',
    },
  )

  return selection?.value
}
