# PRD: Toggle Inline Annotations by Category

## Introduction

Add the ability to toggle inline annotations visibility by category type (bug, question, suggestion, nitpick, note). Currently, annotations are always visible when enabled. This feature allows users to show/hide specific types of annotations to reduce visual clutter and focus on relevant feedback.

## Goals

- Allow users to toggle visibility of annotations by category type
- Provide command palette access for toggling specific categories
- Keep toggle state session-only (reset on restart)
- Maintain existing global toggle behavior for all annotations

## User Stories

### US-001: Add toggle command for each category
**Description:** As a user, I want to toggle visibility of a specific category's annotations so I can focus on particular types of feedback.

**Acceptance Criteria:**
- [ ] Command `codeReview.toggleCategoryAnnotations` available in command palette
- [ ] Quick pick menu shows all 5 categories with current visibility state (checkmark or empty)
- [ ] Selecting a category toggles its visibility
- [ ] Decorations update immediately after toggle
- [ ] Typecheck passes

### US-002: Track category visibility state
**Description:** As a developer, I need to store which categories are visible so the decoration system can filter accordingly.

**Acceptance Criteria:**
- [ ] Add module-level state to track visible categories (default: all visible)
- [ ] State resets to all-visible on extension activation
- [ ] Export getter function to check if a category is visible
- [ ] Typecheck passes

### US-003: Filter decorations by category visibility
**Description:** As a user, I want annotations to appear/disappear based on my category visibility settings.

**Acceptance Criteria:**
- [ ] `updateDecorations` respects category visibility state
- [ ] Hidden categories show no gutter icons, background, or inline text
- [ ] Visible categories display normally based on existing settings
- [ ] Typecheck passes

### US-004: Show current visibility status in quick pick
**Description:** As a user, I want to see which categories are currently visible when I open the toggle menu.

**Acceptance Criteria:**
- [ ] Quick pick items show `$(check)` icon for visible categories
- [ ] Quick pick items show no icon for hidden categories
- [ ] Description shows "Visible" or "Hidden" status
- [ ] Typecheck passes

### US-005: Reset all categories to visible
**Description:** As a user, I want to quickly show all categories again after hiding some.

**Acceptance Criteria:**
- [ ] "Show All" option appears at top of quick pick menu
- [ ] Selecting "Show All" sets all categories to visible
- [ ] Decorations update immediately after reset
- [ ] Typecheck passes

### US-006: Disable all categories
**Description:** As a user, I want to quickly hide all category annotations at once.

**Acceptance Criteria:**
- [ ] "Hide All" option appears at top of quick pick menu (after "Show All")
- [ ] Selecting "Hide All" sets all categories to hidden
- [ ] All inline annotations disappear immediately
- [ ] Typecheck passes

## Functional Requirements

- FR-1: Add `codeReview.toggleCategoryAnnotations` command to package.json
- FR-2: Create `categoryVisibility` state as `Map<CommentCategory, boolean>` initialized with all categories visible
- FR-3: Add `isCategoryVisible(category: CommentCategory): boolean` function
- FR-4: Add `toggleCategoryVisibility(category: CommentCategory): void` function
- FR-5: Modify `updateDecorations` to skip comments where `isCategoryVisible(comment.category)` returns false
- FR-6: Register command in `registerCommands()` function
- FR-7: Refresh all decorations after toggling visibility
- FR-8: Add `showAllCategories(): void` function to set all categories visible
- FR-9: Add `hideAllCategories(): void` function to set all categories hidden
- FR-10: Include "Show All" and "Hide All" options at top of quick pick menu

## Non-Goals

- No persistence of visibility state across sessions
- No keyboard shortcuts for individual category toggles
- No status bar indicator showing visibility state
- No "Show All" / "Hide All" bulk operations (can add later)

## Technical Considerations

- Visibility state stored in `decorations.ts` module alongside decoration types
- Reuse existing `CATEGORY_ITEMS` from `commands.ts` for quick pick
- Use `$(check)` codicon for visible state indicator
- Call `refreshAllDecorations()` after state change

## Success Metrics

- Users can toggle category visibility in under 3 interactions
- No performance regression when updating decorations
- State correctly resets on extension reload

## Open Questions

~~- Should we add a "Reset All" option to show all categories again?~~ **Yes - include "Reset All" option**
~~- Should the tree view also filter based on category visibility?~~ **No - tree view remains unaffected**
