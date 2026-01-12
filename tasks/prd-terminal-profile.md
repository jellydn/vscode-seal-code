# PRD: Terminal Profile for Session Management

## Introduction

Add terminal profile support to run AI reviews within terminal multiplexers (tmux, screen, zellij). This allows users to group all AI review sessions within a single managed session per workspace, making it easier to monitor multiple reviews and maintain session persistence.

## Goals

- Support running AI reviews in tmux, screen, or zellij sessions
- Maintain one session per workspace for grouped review management
- Provide graceful handling when preferred multiplexer is unavailable
- Keep backward compatibility with default VSCode terminal behavior

## User Stories

### US-001: Add terminal profile configuration ✅
**Description:** As a user, I want to configure my preferred terminal profile so that all AI reviews run within my chosen session manager.

**Acceptance Criteria:**
- [x] Add `seal-code.terminalProfile` setting with options: `default`, `tmux` *(screen, zellij deferred)*
- [x] Default value is `default` (current behavior)
- [x] Setting is documented in package.json contributes.configuration
- [x] Typecheck passes

### US-002: Implement tmux session management ✅
**Description:** As a user, I want AI reviews to run in a tmux session so I can manage multiple reviews in one place.

**Acceptance Criteria:**
- [x] Create or attach to workspace-specific tmux session (e.g., `sealcode-{workspace-name}`)
- [x] Each AI review creates a new tmux window within the session
- [x] Window is named with template name and AI tool (e.g., `review-claude`)
- [x] Command executes within the tmux window
- [x] Typecheck passes

### US-003: Implement screen session management 🔜 (Deferred)
**Description:** As a user, I want AI reviews to run in a GNU screen session as an alternative to tmux.

**Acceptance Criteria:**
- [ ] Create or attach to workspace-specific screen session
- [ ] Each AI review creates a new screen window
- [ ] Window is titled appropriately
- [ ] Command executes within the screen window
- [ ] Typecheck passes

### US-004: Implement zellij session management 🔜 (Deferred)
**Description:** As a user, I want AI reviews to run in a zellij session for modern terminal multiplexing.

**Acceptance Criteria:**
- [ ] Create or attach to workspace-specific zellij session
- [ ] Each AI review creates a new zellij pane or tab
- [ ] Pane/tab is named appropriately
- [ ] Command executes within zellij
- [ ] Typecheck passes

### US-005: Handle missing multiplexer gracefully ✅
**Description:** As a user, I want to be prompted to choose an alternative when my preferred multiplexer is not installed.

**Acceptance Criteria:**
- [x] Check if configured multiplexer binary exists before use
- [x] If not found, show quick pick with available alternatives + default option
- [ ] Remember user's choice for session (optional: persist preference) *(not implemented)*
- [x] Proceed with selected alternative
- [x] Typecheck passes

## Functional Requirements

- FR-1: ✅ Add `seal-code.terminalProfile` enum setting: `default` | `tmux` *(screen, zellij deferred)*
- FR-2: ✅ Session naming convention: `sealcode-{workspace-basename}` (sanitized for shell)
- FR-3: ✅ For tmux: use `tmux new-session -A -s {session} -n {window-name} '{command}'`
- FR-4: 🔜 For screen: use `screen -S {session} -X screen -t {window-name}` then send command *(deferred)*
- FR-5: 🔜 For zellij: use `zellij attach {session} --create` with action commands *(deferred)*
- FR-6: ✅ Check binary availability via `which {binary}` before execution
- FR-7: ✅ Quick pick for fallback shows "Default Terminal" option

## Non-Goals

- No per-AI-tool terminal profile settings
- No custom session naming configuration
- No automatic installation of multiplexers
- No support for Windows-specific terminal multiplexers (ConEmu, etc.)

## Technical Considerations

- ✅ Create new `terminalProfile.ts` module for multiplexer logic
- ✅ Reuse existing `sendCommandToTerminal` pattern for default behavior
- ✅ Binary detection should be async and cached per session
- ✅ Workspace name sanitization needed (remove spaces, special chars)
- ✅ Consider macOS vs Linux path differences for binary detection

## Success Metrics

- ✅ Users can run multiple AI reviews grouped in single multiplexer session
- ✅ Fallback prompt appears within 1 second when multiplexer missing
- ✅ No regression in default terminal behavior

## Open Questions

- Should we add a "Don't ask again" option in the fallback prompt? *(not implemented)*
- Should session attach behavior open in integrated terminal or external? *(uses integrated terminal)*

## Implementation Status

| Component | Status |
|-----------|--------|
| Config setting | ✅ Complete |
| terminalProfile.ts module | ✅ Complete |
| tmux support | ✅ Complete |
| screen support | 🔜 Deferred |
| zellij support | 🔜 Deferred |
| Fallback prompt | ✅ Complete |
| Unit tests (14 tests) | ✅ Passing |
