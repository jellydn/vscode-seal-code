# AGENTS.md - Development Guidelines for SealCode VSCode Extension

## Overview
SealCode is a VSCode extension for smart code review management. This document provides guidelines for agents working on this codebase.

## Package Management
- **Package manager**: pnpm
- **Preferred alias**: Use `nr` instead of `pnpm` for running scripts
- **No Prettier**: ESLint handles all formatting automatically

## Essential Commands

### Development
- `nr build` - Build the extension with tsdown (outputs to `./dist`)
- `nr dev` - Watch mode with sourcemaps for development
- `nr update` - Regenerate VSCode metadata from package.json

### Quality Assurance
- `nr lint` - Run ESLint (auto-fixes on save in VSCode)
- `nr typecheck` - Run TypeScript compiler with noEmit
- `nr test` - Run all tests with vitest
- `nr test run <path>` - Run a specific test file (e.g., `nr test run test/unit/aiTools.test.ts`)
- `nr test watch` - Run tests in watch mode

**Critical**: After any JS/TS changes, always run: `nr lint && nr typecheck`

## TypeScript Configuration
- Strict mode enabled with `strictNullChecks: true`
- Target: ES2017
- Module: ESNext
- Module resolution: node with JSON module support
- `skipLibCheck: true` for faster builds

## Code Style Guidelines

### Imports
- Use Node protocol imports: `import { x } from 'node:module'`
- Use reactive-vscode for VSCode extension APIs: `import { defineExtension } from 'reactive-vscode'`
- Import vscode types: `import { window, workspace } from 'vscode'`
- Import test utilities: `import { describe, expect, it } from 'vitest'`

### Naming Conventions
- **Variables and functions**: camelCase (`getCommentsFilePath`, `ensureCodeReviewDir`)
- **Types and interfaces**: PascalCase (`Comment`, `CommentStorage`)
- **Constants**: SCREAMING_SNAKE_CASE (`CODEREVIEW_DIR`, `COMMENTS_FILE`)
- **Enum members**: UPPER_SNAKE_CASE or PascalCase based on context

### Code Patterns
- Use **guard clauses** (early returns) instead of deep nesting
- Use **defineExtension()** from reactive-vscode for activation/deactivation
- Export types explicitly: `export type`, `export interface`
- Prefer `async/await` over promises
- Use try/catch blocks for error handling (catch without variable is acceptable)
- Use `crypto.randomUUID()` for generating unique IDs

### Error Handling
- Use guard clauses for null/undefined checks early in functions
- Catch errors at appropriate boundaries without swallowing them
- Show user-facing errors with `window.showErrorMessage()`
- Log errors appropriately for debugging

### VSCode Extension Patterns
- Use `Uri.joinPath()` for path manipulation
- Use `workspace.fs` for file operations (`createDirectory`, `readFile`, `writeFile`)
- Use `window.showInformationMessage()` and `window.showErrorMessage()` for user feedback
- Use `crypto.randomUUID()` for generating IDs
- Use `new TextEncoder().encode()` and `new TextDecoder().decode()` for file content
- Subscribe to VSCode events in the extension activation function
- Return a dispose function from activation for cleanup

### Formatting
- No semicolons (style preference from @antfu/eslint-config)
- ESLint handles auto-fix on save
- Run `nr lint` to fix all issues automatically
- Use consistent line breaks and whitespace

## File Structure
- `src/` - Main source code
- `src/index.ts` - Extension entry point with activation/deactivation
- `src/commands.ts` - Command registration and handlers
- `src/treeView.ts` - Tree view provider implementation
- `src/decorations.ts` - Inline decoration rendering
- `src/storage.ts` - File storage operations
- `src/CommentStorage.ts` - Comment data management
- `src/types.ts` - TypeScript type definitions
- `src/config.ts` - Configuration management
- `src/aiTools.ts` - AI tool integrations
- `src/aiConfig.ts` - AI configuration handling
- `src/aiReview.ts` - AI review functionality
- `src/commandBuilder.ts` - Command building utilities
- `src/terminalProfile.ts` - Terminal profile handling
- `test/` - Test files following source structure
- `test/unit/` - Unit tests matching source file names

## Testing Guidelines
- **Framework**: vitest
- **Structure**: `describe('feature', () => { it('should do X', () => { ... }) })`
- **Test files**: Mirror source file structure in `test/unit/`
- **Helpers**: Place utilities in `test/helpers/`
- **Fixtures**: Place test data factories in `test/fixtures/`
- **Test patterns**:
  - Test constants and utilities directly
  - Test validation and transformation functions
  - Use descriptive test names that explain expected behavior
  - Group related tests with nested `describe` blocks

### Key Test Files
- `test/unit/aiTools.test.ts` - AI tool validation and default models
- `test/unit/aiConfig.test.ts` - AI configuration and validation logic
- `test/unit/aiReview.test.ts` - Comment formatting for AI export
- `test/unit/commandBuilder.test.ts` - Command building and interpolation
- `test/unit/filtering.test.ts` - Comment filtering and sorting logic
- `test/unit/storage.test.ts` - Storage path and directory operations
- `test/unit/CommentStorage.test.ts` - Comment CRUD operations
- `test/unit/terminalProfile.test.ts` - Terminal profile handling

## Additional Rules
- Keep code modular and self-documenting
- Use meaningful variable names that explain intent
- Avoid over-engineering - keep solutions simple
- No comments unless necessary for complex logic
- Maintain consistent patterns across similar files
- Follow existing code style when making changes
