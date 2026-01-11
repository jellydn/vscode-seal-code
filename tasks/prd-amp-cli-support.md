# PRD: Amp CLI Support

## Introduction

Add Amp CLI as an AI tool option for code reviews. Users can use Amp CLI (`amp -x`) to process review comments with configurable model modes (rush, smart).

## Goals

- Add Amp as a selectable AI tool option
- Support model modes: rush, smart (execute mode requires these)
- Follow existing patterns established by Claude/Copilot/OpenCode integrations
- Default to "smart" mode

## User Stories

### US-001: Add Amp CLI as AI tool option ✅
**Description:** As a developer, I want to select Amp CLI as my AI tool so that I can use it for code reviews.

**Acceptance Criteria:**
- [x] Add `AMP` constant to `AI_TOOLS` in aiTools.ts
- [x] Add `amp` to `AiToolType` type
- [x] Add default model function returns 'smart' for amp
- [x] Typecheck passes

### US-002: Configure Amp CLI command builder ✅
**Description:** As a developer, I need Amp CLI commands to be built correctly with the right flags.

**Acceptance Criteria:**
- [x] Add Amp config to `AI_TOOL_CONFIGS` in aiConfig.ts
- [x] Command format: `amp -x "{{prompt}}" --mode {{model}} --dangerously-allow-all`
- [x] requiresModel: true, defaultModel: 'smart'
- [x] Typecheck passes

### US-003: Add Amp to AI tool quick pick ✅
**Description:** As a user, I want to see Amp in the AI tool selection dropdown.

**Acceptance Criteria:**
- [x] Add Amp option to quick pick in commands.ts
- [x] Include label 'Amp' with value AI_TOOLS.AMP
- [x] Typecheck passes

### US-004: Add Amp model configuration setting ✅
**Description:** As a user, I want to configure the Amp model/mode in VSCode settings.

**Acceptance Criteria:**
- [x] Add `codeNotes.aiTool.ampModel` setting to package.json
- [x] Default value: 'smart'
- [x] Enum options: rush, smart
- [x] Run `nr update` to regenerate metadata
- [x] Update aiReview.ts to read Amp model config
- [x] Typecheck passes

## Functional Requirements

- FR-1: Add `AMP = 'amp'` to AI_TOOLS constant ✅
- FR-2: Return 'smart' as default model for Amp in `getAiToolDefaultModel()` ✅
- FR-3: Add Amp config with command template `amp -x "{{prompt}}" --mode {{model}} --dangerously-allow-all` ✅
- FR-4: Add Amp to quick pick selection with label "Amp" ✅
- FR-5: Add VSCode configuration `codeNotes.aiTool.ampModel` with enum [rush, smart] ✅
- FR-6: Handle Amp model selection in `buildAICommand()` function ✅

## Non-Goals

- No interactive Amp sessions (only execute mode)
- No MCP server configuration through this extension
- No Amp authentication management

## Technical Considerations

- Follow existing patterns from Copilot CLI integration
- Use `--dangerously-allow-all` to avoid approval prompts in automated context
- Use `-x` (execute mode) for non-interactive operation
- **Note:** Execute mode is not permitted with `--mode free`, must use rush or smart

## Success Metrics

- Amp CLI commands execute successfully from the extension
- Model mode selection works correctly
- No regression in existing AI tool functionality

## Open Questions

- None

## Implementation Notes

- Changed default from 'free' to 'smart' because Amp's execute mode (`-x`) requires rush or smart mode
- Removed 'free' from enum options in package.json settings
