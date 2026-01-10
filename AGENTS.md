# AGENTS.md - Development Guidelines for VSCode Extension

## Package Management
- Package manager: **pnpm**
- Use `nr` alias (preferred) or `pnpm` for running scripts
- No Prettier - ESLint handles all formatting

## Essential Commands

### Development
- `nr build` - Build the extension with tsdown
- `nr dev` - Watch mode with sourcemaps
- `nr update` - Regenerate VSCode metadata from package.json

### Quality Assurance
- `nr lint` - Run ESLint (auto-fixes on save in VSCode)
- `nr typecheck` - Run TypeScript compiler with noEmit
- `nr test` - Run all tests with vitest
- `nr test run <path>` - Run a specific test file (e.g., `nr test run test/storage.test.ts`)
- `nr test watch` - Run tests in watch mode

**CRITICAL**: After any JS/TS changes, always run: `nr lint` && `nr typecheck`

## Code Style Guidelines

### TypeScript Configuration
- Strict mode enabled
- Target: ES2017
- Module: ESNext
- No lib files checked (skipLibCheck: true)

### Imports
- Use Node protocol imports: `import { x } from 'node:module'`
- Use reactive-vscode for VSCode extension APIs: `import { defineExtension } from 'reactive-vscode'`
- Import vscode types: `import { window, workspace } from 'vscode'`

### Naming Conventions
- Variables and functions: **camelCase** (`getCommentsFilePath`, `ensureCodeReviewDir`)
- Types and interfaces: **PascalCase** (`Comment`, `CommentStorage`)
- Constants: **SCREAMING_SNAKE_CASE** (`CODEREVIEW_DIR`, `COMMENTS_FILE`)

### Code Patterns
- Use **guard clauses** (early returns) instead of deep nesting
- Use **defineExtension()** from reactive-vscode for activation/deactivation
- Export types explicitly: `export type`, `export interface`
- Prefer `async/await` over promises
- Use try/catch blocks for error handling (catch without variable is acceptable)

### VSCode Extension Patterns
- Use `Uri.joinPath()` for path manipulation
- Use `workspace.fs` for file operations (createDirectory, readFile, writeFile)
- Use `window.showInformationMessage()` and `window.showErrorMessage()` for user feedback
- Use `crypto.randomUUID()` for generating IDs
- Use `new TextEncoder().encode()` and `new TextDecoder().decode()` for file content

### Testing
- Framework: **vitest**
- Import: `import { describe, expect, it } from 'vitest'`
- Structure: `describe('feature', () => { it('should do X', () => { ... }) })`

### Formatting
- No semicolons (style preference from @antfu/eslint-config)
- ESLint handles auto-fix on save
- Run `nr lint` to fix all issues

### Additional Rules
- Keep code modular and self-documenting
- Use meaningful variable names that explain intent
- Avoid over-engineering - keep solutions simple
- No comments unless necessary for complex logic
