import { describe, expect, it, vi } from 'vitest'
import { buildTmuxCommand, getSessionName } from '../../src/terminalProfile'

vi.mock('vscode', () => ({
  window: {
    showQuickPick: vi.fn(),
  },
}))

describe('terminalProfile', () => {
  describe('getSessionName', () => {
    it('should prefix with sealcode-', () => {
      const result = getSessionName('myproject')
      expect(result).toBe('sealcode-myproject')
    })

    it('should convert to lowercase', () => {
      const result = getSessionName('MyProject')
      expect(result).toBe('sealcode-myproject')
    })

    it('should replace spaces with hyphens', () => {
      const result = getSessionName('my project name')
      expect(result).toBe('sealcode-my-project-name')
    })

    it('should replace special characters with hyphens', () => {
      const result = getSessionName('my_project@v1.0')
      expect(result).toBe('sealcode-my-project-v1-0')
    })

    it('should collapse multiple hyphens into one', () => {
      const result = getSessionName('my---project')
      expect(result).toBe('sealcode-my-project')
    })

    it('should trim leading and trailing hyphens', () => {
      const result = getSessionName('-my-project-')
      expect(result).toBe('sealcode-my-project')
    })

    it('should handle complex workspace names', () => {
      const result = getSessionName('  My Complex__Project (v2.0)  ')
      expect(result).toBe('sealcode-my-complex-project-v2-0')
    })

    it('should return sealcode-workspace for empty string', () => {
      const result = getSessionName('')
      expect(result).toBe('sealcode-workspace')
    })

    it('should return sealcode-workspace for string with only special chars', () => {
      const result = getSessionName('___')
      expect(result).toBe('sealcode-workspace')
    })
  })

  describe('buildTmuxCommand', () => {
    it('should build correct tmux command format', () => {
      const result = buildTmuxCommand('mysession', 'mywindow', 'echo hello')
      expect(result).toBe(
        `tmux new-session -A -s mysession -n mywindow -d && tmux send-keys -t mysession:mywindow 'echo hello' Enter && tmux attach -t mysession`,
      )
    })

    it('should escape single quotes in command', () => {
      const result = buildTmuxCommand('session', 'window', `echo 'hello world'`)
      expect(result).toBe(
        `tmux new-session -A -s session -n window -d && tmux send-keys -t session:window 'echo '\\''hello world'\\''' Enter && tmux attach -t session`,
      )
    })

    it('should handle commands with multiple single quotes', () => {
      const result = buildTmuxCommand('session', 'window', `echo 'a' && echo 'b'`)
      expect(result).toContain(`'\\''a'\\''`)
      expect(result).toContain(`'\\''b'\\''`)
    })

    it('should preserve double quotes in command', () => {
      const result = buildTmuxCommand('session', 'window', 'echo "hello"')
      expect(result).toContain(`'echo "hello"'`)
    })

    it('should handle complex real-world command', () => {
      const result = buildTmuxCommand(
        'sealcode-vscode-seal-code',
        'claude-review',
        `claude --model sonnet "Review this code for bugs"`,
      )
      expect(result).toBe(
        `tmux new-session -A -s sealcode-vscode-seal-code -n claude-review -d && tmux send-keys -t sealcode-vscode-seal-code:claude-review 'claude --model sonnet "Review this code for bugs"' Enter && tmux attach -t sealcode-vscode-seal-code`,
      )
    })
  })
})
