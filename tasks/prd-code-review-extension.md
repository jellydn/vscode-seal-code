# PRD: Code Review Annotation Extension

## Introduction

A VSCode extension that enables developers to annotate code with inline comments, questions, and notes during self-review before PR submission. Comments are persisted locally in the workspace, categorized by type (Bug, Question, Suggestion, Nitpick, Note), and can be exported to Markdown/HTML reports for sharing or documentation.

## Goals

- Enable adding comments on single lines or line ranges
- Categorize comments with predefined types for quick classification
- Persist comments locally in `.codereview/` directory
- Provide visual indicators (gutter icons, inline decorations) for annotated lines
- Display all comments in a dedicated sidebar panel
- Support filtering comments by category or file
- Export comments to Markdown/HTML reports

## User Stories

### US-001: Initialize Review Storage
**Description:** As a developer, I want the extension to create a `.codereview/` directory to store my annotations locally.

**Acceptance Criteria:**
- [ ] Creates `.codereview/` folder in workspace root on first comment
- [ ] Stores comments in `.codereview/comments.json`
- [ ] Adds `.codereview/` to `.gitignore` suggestion (optional prompt)
- [ ] Typecheck passes

### US-002: Add Comment on Single Line
**Description:** As a developer, I want to add a comment on a specific line so I can note issues or questions.

**Acceptance Criteria:**
- [ ] Right-click context menu shows "Add Review Comment"
- [ ] Command palette includes "Code Review: Add Comment"
- [ ] Keyboard shortcut `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac) triggers add comment
- [ ] Input box prompts for comment text
- [ ] Category picker shows: Bug, Question, Suggestion, Nitpick, Note
- [ ] Comment saved with file path, line number, text, category, timestamp
- [ ] Typecheck passes

### US-003: Add Comment on Line Range
**Description:** As a developer, I want to select multiple lines and add a comment spanning that range.

**Acceptance Criteria:**
- [ ] When text is selected, context menu shows "Add Review Comment"
- [ ] Comment stored with startLine and endLine
- [ ] Visual decoration spans entire selected range
- [ ] Typecheck passes

### US-004: Display Gutter Icons
**Description:** As a developer, I want to see icons in the gutter for lines with comments so I can quickly identify annotated code.

**Acceptance Criteria:**
- [ ] Gutter icon appears on lines with comments
- [ ] Icon color/style varies by category (e.g., red for Bug, blue for Question)
- [ ] Hovering gutter icon shows comment preview tooltip
- [ ] Typecheck passes

### US-005: Inline Text Decorations
**Description:** As a developer, I want inline visual cues showing comment category/preview.

**Acceptance Criteria:**
- [ ] Line background subtly tinted by category color
- [ ] After-line decoration shows truncated comment text
- [ ] Decoration style configurable (on/off, colors)
- [ ] Typecheck passes

### US-006: Sidebar Panel - Comment List
**Description:** As a developer, I want a sidebar panel listing all comments so I can navigate and manage them.

**Acceptance Criteria:**
- [ ] Activity bar icon for "Code Review"
- [ ] Tree view grouped by file
- [ ] Each comment shows: category icon, line number, truncated text
- [ ] Clicking comment navigates to that line in editor
- [ ] Typecheck passes

### US-007: Edit Existing Comment
**Description:** As a developer, I want to edit a comment's text or category after creating it.

**Acceptance Criteria:**
- [ ] Right-click comment in sidebar shows "Edit Comment"
- [ ] Clicking gutter icon allows editing
- [ ] Can update text and/or category
- [ ] Timestamp updated to modification time
- [ ] Typecheck passes

### US-008: Delete Comment
**Description:** As a developer, I want to delete comments I no longer need.

**Acceptance Criteria:**
- [ ] Right-click comment in sidebar shows "Delete Comment"
- [ ] Keyboard shortcut `Delete` works when comment selected in sidebar
- [ ] Confirmation prompt before deletion (configurable)
- [ ] Gutter icon and decorations removed immediately
- [ ] Typecheck passes

### US-009: Filter Comments by Category
**Description:** As a developer, I want to filter the sidebar to show only specific categories.

**Acceptance Criteria:**
- [ ] Filter dropdown in sidebar header
- [ ] Options: All, Bug, Question, Suggestion, Nitpick, Note
- [ ] Filter state persists during session
- [ ] Count badge shows filtered results
- [ ] Typecheck passes

### US-010: Filter Comments by File
**Description:** As a developer, I want to show comments only for the current file or specific files.

**Acceptance Criteria:**
- [ ] Toggle: "Show All Files" / "Current File Only"
- [ ] Quick filter text input to search by filename
- [ ] Typecheck passes

### US-011: Export to Markdown
**Description:** As a developer, I want to export all comments to a Markdown file for PR description or documentation.

**Acceptance Criteria:**
- [ ] Command "Code Review: Export to Markdown"
- [ ] Output file: `.codereview/review-report.md`
- [ ] Grouped by file with line numbers
- [ ] Shows category, comment text, timestamp
- [ ] Includes code snippet (3 lines before/after commented lines)
- [ ] Code snippets in fenced code blocks with language syntax
- [ ] Typecheck passes

### US-012: Export to HTML
**Description:** As a developer, I want to export comments to a styled HTML report.

**Acceptance Criteria:**
- [ ] Command "Code Review: Export to HTML"
- [ ] Output file: `.codereview/review-report.html`
- [ ] Styled with category colors
- [ ] Includes links to file:line (vscode:// protocol)
- [ ] Includes code snippet (3 lines before/after commented lines)
- [ ] Code snippets with syntax highlighting (use highlight.js or similar)
- [ ] Typecheck passes

### US-013: Clear All Comments
**Description:** As a developer, I want to clear all comments when starting fresh.

**Acceptance Criteria:**
- [ ] Command "Code Review: Clear All Comments"
- [ ] Confirmation dialog with count of comments to delete
- [ ] Removes all entries from comments.json
- [ ] Clears all decorations and gutter icons
- [ ] Typecheck passes

### US-014: Comment Persistence on File Rename/Move
**Description:** As a developer, I want comments to follow files when renamed or moved.

**Acceptance Criteria:**
- [ ] Watch for file rename/move events
- [ ] Update file paths in comments.json
- [ ] Decorations reapply to new location
- [ ] Typecheck passes

## Functional Requirements

- FR-1: Store comments in `.codereview/comments.json` as JSON array
- FR-2: Each comment object contains: `id`, `filePath`, `startLine`, `endLine`, `text`, `category`, `createdAt`, `updatedAt`
- FR-3: Categories are fixed: `bug`, `question`, `suggestion`, `nitpick`, `note`
- FR-4: Gutter icons use distinct colors: Bug (red), Question (blue), Suggestion (green), Nitpick (orange), Note (gray)
- FR-5: Decorations update in real-time when comments added/edited/deleted
- FR-6: Sidebar tree view refreshes automatically on data changes
- FR-7: Export commands generate files in `.codereview/` directory
- FR-8: All line numbers are 1-indexed to match editor display
- FR-9: Comments survive editor/VSCode restarts via file persistence
- FR-10: Handle line number drift gracefully (comments may become stale after significant edits)

## Non-Goals

- No cloud sync or team collaboration features
- No GitHub/GitLab PR integration
- No real-time multi-user editing
- No inline diff view
- No AI-assisted comment suggestions
- No custom category creation (fixed set only)

## Technical Considerations

- Built with `reactive-vscode` framework (already in project)
- Use VSCode TreeDataProvider for sidebar
- Use TextEditorDecorationType for inline decorations
- Use workspace.fs for file operations
- Consider debouncing decoration updates for performance
- Use UUID for comment IDs

## Design Considerations

### Category Colors
| Category   | Gutter Icon | Line Tint    |
|------------|-------------|--------------|
| Bug        | 🔴 Red      | #ff000010    |
| Question   | 🔵 Blue     | #0066ff10    |
| Suggestion | 🟢 Green    | #00990010    |
| Nitpick    | 🟠 Orange   | #ff990010    |
| Note       | ⚪ Gray     | #66666610    |

### Comment JSON Schema
```json
{
  "id": "uuid",
  "filePath": "relative/path/to/file.ts",
  "startLine": 10,
  "endLine": 15,
  "text": "This looks like a potential null pointer issue",
  "category": "bug",
  "createdAt": "2026-01-10T12:00:00Z",
  "updatedAt": "2026-01-10T12:00:00Z"
}
```

## Success Metrics

- Add a comment in under 3 seconds (2 clicks + typing)
- Navigate to any comment from sidebar in 1 click
- Export full report in under 2 seconds
- Zero data loss on VSCode restart
- No noticeable performance impact with 100+ comments

## Open Questions

None - all questions resolved.
