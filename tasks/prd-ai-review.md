# PRD: Send Review Comments to AI Terminal

## Introduction

Add the ability to send review comments from the `.codereview/` folder to AI terminal tools (Claude Code or OpenCode) with predefined prompt templates. This enables developers to validate architectural decisions and get AI feedback on their review notes before implementation, using "plan mode" for thoughtful analysis.

## Goals

- Send all or selected comments from `.codereview/comments.json` to AI terminal
- Support both Claude Code (`claude`) and OpenCode (`opencode`) CLI tools
- Use customizable prompt templates for consistent review requests
- Enable "plan mode" flag for thoughtful, non-implementing AI responses
- Provide user-defined scope options (all comments, by file, by category, selected)

## User Stories

### US-001: Configure AI Terminal Tool
**Description:** As a developer, I want to configure which AI CLI tool to use so I can choose my preferred AI assistant.

**Acceptance Criteria:**
- [ ] Add `vscode-code-notes.aiTool` setting with options: `claude`, `opencode`, `custom`
- [ ] Add `vscode-code-notes.aiToolCommand` setting for custom command path
- [ ] Default to `claude` if not configured
- [ ] Typecheck passes

### US-002: Configure Prompt Templates
**Description:** As a developer, I want to define prompt templates so AI receives consistent, well-structured review requests.

**Acceptance Criteria:**
- [ ] Add `vscode-code-notes.promptTemplates` setting as object with named templates
- [ ] Default template: "Review these code comments and validate the architectural decisions. Respond in plan mode - analyze and suggest, do not implement."
- [ ] Templates support `{{comments}}` placeholder for injecting formatted comments
- [ ] Templates support `{{files}}` placeholder for affected file list
- [ ] Typecheck passes

### US-003: Send All Comments to AI
**Description:** As a developer, I want to send all my review comments to AI for comprehensive validation.

**Acceptance Criteria:**
- [ ] Add command `codeReview.sendToAI` with title "Send to AI Review"
- [ ] Opens integrated terminal and runs AI CLI with plan mode flags:
  - Claude: `-p --permission-mode plan`
  - OpenCode: `run` subcommand with configurable `--agent`
- [ ] Formats all comments as structured input with file paths, line numbers, categories, and text
- [ ] Shows notification on success/failure
- [ ] Typecheck passes

### US-004: Send Selected Comments to AI
**Description:** As a developer, I want to select specific comments from the sidebar and send only those to AI.

**Acceptance Criteria:**
- [ ] Add command `codeReview.sendSelectedToAI` with title "Send Selected to AI"
- [ ] Show QuickPick with multi-select of all comments (grouped by file)
- [ ] Only send selected comments to AI terminal
- [ ] Typecheck passes

### US-005: Send Comments by Category to AI
**Description:** As a developer, I want to send comments filtered by category (e.g., only bugs or questions) for focused review.

**Acceptance Criteria:**
- [ ] Add command `codeReview.sendCategoryToAI` with title "Send Category to AI"
- [ ] Show QuickPick to select category (bug, question, suggestion, nitpick, note)
- [ ] Filter comments by selected category before sending
- [ ] Typecheck passes

### US-006: Select Prompt Template Before Sending
**Description:** As a developer, I want to choose which prompt template to use when sending to AI.

**Acceptance Criteria:**
- [ ] Show QuickPick with available templates before sending
- [ ] Include "Custom..." option to enter one-time prompt
- [ ] Apply selected template with placeholders replaced
- [ ] Typecheck passes

### US-007: Add Context Menu Entry for AI Review
**Description:** As a developer, I want quick access to send comments to AI from the sidebar.

**Acceptance Criteria:**
- [ ] Add "Send to AI Review" to view/title menu in codeReviewComments view
- [ ] Add icon `$(sparkle)` for AI-related commands
- [ ] Typecheck passes

## Functional Requirements

- FR-1: Add configuration settings for AI tool selection (`claude` | `opencode` | `custom`)
- FR-2: Add configuration for custom AI CLI command path
- FR-3: Add configuration for named prompt templates with placeholder support
- FR-4: Format comments as structured text: `[category] file:line - text`
- FR-5: Execute AI CLI in integrated terminal:
  - Claude: `claude -p --permission-mode plan "prompt"`
  - OpenCode: `opencode run --agent plan "prompt"`
- FR-6: Support sending all comments, selected comments, or filtered by category
- FR-7: Show prompt template picker before sending
- FR-8: Handle errors gracefully (no comments, AI CLI not found)

## Non-Goals

- No direct AI API integration (use CLI tools only)
- No streaming responses or inline AI display
- No automatic implementation of AI suggestions
- No persistent AI conversation history
- No AI-generated comments creation

## Technical Considerations

- Use `vscode.window.createTerminal()` for executing CLI commands
- Format prompt as heredoc or temp file for multi-line input
- Reuse existing `CommentStorage` for retrieving comments
- Consider escaping special characters in comment text
- CLI execution patterns:
  - Claude: `claude -p --permission-mode plan "prompt"` (non-interactive + plan mode)
  - OpenCode: `opencode run --agent plan "prompt"` (uses built-in `plan` agent)
- OpenCode built-in agents: `plan` (analyze only), `build` (implement)

## Success Metrics

- Send comments to AI in under 3 clicks
- AI receives well-formatted, structured input
- Plan mode prevents accidental code changes
- Works with both Claude Code and OpenCode

## Open Questions

- Should we support additional AI CLI tools (Copilot CLI, Aider)?
- Should template selection be remembered per session?
- Should we add a keyboard shortcut for quick AI review?
