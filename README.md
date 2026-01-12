<p align="center">
  <img src="https://raw.githubusercontent.com/jellydn/vscode-seal-code/main/res/icon-512.png" width="128" height="128" alt="SealCode Logo">
</p>

<h1 align="center">SealCode</h1>

<p align="center">
  <strong>Smart Code Review with AI-Powered Insights</strong>
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=jellydn.seal-code"><img src="https://img.shields.io/visual-studio-marketplace/v/jellydn.seal-code.svg?color=blue&label=VS%20Code%20Marketplace&logo=visual-studio-code" alt="VS Code Marketplace" /></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=jellydn.seal-code"><img src="https://img.shields.io/visual-studio-marketplace/d/jellydn.seal-code.svg?color=blue" alt="Downloads" /></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=jellydn.seal-code"><img src="https://img.shields.io/visual-studio-marketplace/r/jellydn.seal-code.svg?color=blue" alt="Rating" /></a>
  <a href="https://open-vsx.org/extension/jellydn/seal-code"><img src="https://img.shields.io/open-vsx/v/jellydn/seal-code?color=purple&label=Open%20VSX" alt="Open VSX" /></a>
  <a href="https://kermanx.github.io/reactive-vscode/"><img src="https://img.shields.io/badge/made_with-reactive--vscode-%23007ACC?style=flat&labelColor=%23229863" alt="Made with reactive-vscode" /></a>
</p>

---

## 💡 Motivation

Code reviews are essential for maintaining code quality, but traditional review workflows have friction:

- **Context switching**: Comments in PRs are disconnected from your editor
- **Lost insights**: Review notes scattered across tools get forgotten
- **Manual follow-up**: No easy way to validate architectural decisions with AI

**SealCode** brings code review directly into VS Code, letting you annotate code in context and leverage AI tools to validate your review comments—turning observations into actionable insights.
[![Screenshot](https://i.gyazo.com/5e87ad6f041a627b2df8bb36103ccde9.png)](https://gyazo.com/5e87ad6f041a627b2df8bb36103ccde9)
## ✨ Features

<table>
  <tr>
    <td width="50%">
      <h3>🤖 AI-Powered Review</h3>
      <p>Send comments to AI tools (<strong>Claude</strong>, <strong>Copilot</strong>, <strong>OpenCode</strong>, <strong>Amp</strong>) for architectural validation, security analysis, and refactoring suggestions.</p>
    </td>
    <td width="50%">
      <h3>📝 Prompt Templates</h3>
      <p>Built-in templates for <strong>review</strong>, <strong>security</strong>, <strong>refactor</strong>, and <strong>simplify</strong> workflows. Create custom templates with <code>{{comments}}</code> and <code>{{files}}</code> placeholders.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🏷️ Categorized Comments</h3>
      <p>Organize notes with 5 categories: <strong>Bug</strong>, <strong>Question</strong>, <strong>Suggestion</strong>, <strong>Nitpick</strong>, and <strong>Note</strong>. Each with distinct colors for quick identification.</p>
    </td>
    <td width="50%">
      <h3>🎨 Rich Visual Feedback</h3>
      <p>Inline decorations, gutter icons, and line backgrounds help you spot comments at a glance.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📁 Smart Filtering</h3>
      <p>Filter by category, filename, or current file only. Find exactly what you need.</p>
    </td>
    <td width="50%">
      <h3>📤 Export Options</h3>
      <p>Export your review comments to <strong>Markdown</strong> or <strong>HTML</strong> for sharing or documentation.</p>
    </td>
  </tr>
</table>

## 🚀 Quick Start

1. **Install** the extension from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=jellydn.seal-code) or search for `jellydn.seal-code` in VS Code Extensions
2. **Select code** in any file
3. Press <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd> (Mac) or <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd> (Windows/Linux)
4. **Choose a category** and add your comment
5. Press <kbd>Cmd</kbd>+<kbd>Option</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> to send comments to AI for analysis

## 📖 Usage

### Adding Comments
- Use the keyboard shortcut <kbd>Cmd/Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd>
- Right-click on selected code → **Code Review: Add Review Comment**
[![add Review Comment](https://i.gyazo.com/a5802b99034a412efb30631e9fc94faf.gif)](https://gyazo.com/a5802b99034a412efb30631e9fc94faf)
- Click the **+** button in the Code Review panel
[![add comment for panel](https://i.gyazo.com/cae7a708a40931be21590ed460a37a6e.gif)](https://gyazo.com/cae7a708a40931be21590ed460a37a6e)

### Managing Comments
- Click on any comment in the sidebar to jump to its location
[![managing comments](https://i.gyazo.com/268476c735358041b054896f798a497e.gif)](https://gyazo.com/268476c735358041b054896f798a497e)
- Use inline edit/delete buttons or the context menu
[![delete comment](https://i.gyazo.com/609236f3397d6c165cb09f68131be969.gif)](https://gyazo.com/609236f3397d6c165cb09f68131be969)
- Press <kbd>Delete</kbd> when a comment is focused to remove it

### Filtering
- **By Category**: Click the filter icon and select categories to show
- **By Filename**: Search for specific files
- **Current File Only**: Toggle to focus on the active file
[![filter](https://i.gyazo.com/244e165facd9e5079cf1015cab8bc3d5.gif)](https://gyazo.com/244e165facd9e5079cf1015cab8bc3d5)

### Exporting
- Open the view menu in the Code Review panel
- Choose **Export to Markdown** or **Export to HTML**
[![exporting](https://i.gyazo.com/1483d0e35d89f1f29efdf9b4564874b3.gif)](https://gyazo.com/1483d0e35d89f1f29efdf9b4564874b3)

### 🤖 AI Review

SealCode integrates with popular AI coding tools to analyze your review comments:
[![send to Opencode](https://i.gyazo.com/fdb9d2a2663f48f1b502934dbdc98c81.gif)](https://gyazo.com/fdb9d2a2663f48f1b502934dbdc98c81)

| Tool | Description | Model Configuration |
|------|-------------|---------------------|
| **Claude** | Anthropic's Claude CLI | haiku, sonnet, opus |
| **Copilot** | GitHub Copilot CLI | gpt-4.1, gpt-4o, o3 |
| **OpenCode** | OpenCode CLI (default) | opencode/big-pickle, opencode/claude |
| **Amp** | Amp CLI | rush, smart |
| **Custom** | Your own AI command | e.g., `ccs glm` |

#### Sending Comments to AI
- **Send All**: Click the ✨ button or press <kbd>Cmd/Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd>
- **Send Selected**: Run **Code Review: Send Selected to AI** to pick specific comments
- **Send by Category**: Run **Code Review: Send Category to AI** to filter by category first

#### Prompt Templates
Choose from built-in templates or create your own:

- **review**: Validate architectural decisions
- **security**: Identify vulnerabilities and suggest mitigations
- **refactor**: Suggest code quality improvements
- **simplify**: Reduce complexity and improve readability

## ⚙️ Configuration

<!-- configs -->

| Key                               | Description                                                                                                          | Type      | Default                                                                                              |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------- |
| `seal-code.showInlineDecorations` | Show inline text decorations (after-line text preview)                                                               | `boolean` | `true`                                                                                               |
| `seal-code.showGutterIcons`       | Show gutter icons for comments                                                                                       | `boolean` | `true`                                                                                               |
| `seal-code.showLineBackground`    | Show colored background on commented lines                                                                           | `boolean` | `true`                                                                                               |
| `seal-code.categoryColors`        | Custom colors for each comment category                                                                              | `object`  | `{"bug":"#f44336","question":"#2196f3","suggestion":"#4caf50","nitpick":"#ff9800","note":"#9e9e9e"}` |
| `seal-code.aiTool`                | AI CLI tool to use for sending review comments                                                                       | `string`  | `"opencode"`                                                                                         |
| `seal-code.aiToolCommand`         | Custom command path for AI tool (used when aiTool is 'custom', e.g., 'ccs glm')                                      | `string`  | `""`                                                                                                 |
| `seal-code.aiToolClaudeModel`     | Claude model to use (e.g., haiku, sonnet, opus)                                                                      | `string`  | `"haiku"`                                                                                            |
| `seal-code.aiToolOpenCodeModel`   | OpenCode model to use (e.g., opencode/big-pickle, opencode/claude)                                                   | `string`  | `"opencode/big-pickle"`                                                                              |
| `seal-code.aiToolCopilotModel`    | Copilot model to use (e.g., gpt-4.1, gpt-4o, o3)                                                                     | `string`  | `"gpt-4.1"`                                                                                          |
| `seal-code.aiToolAmpModel`        | Amp mode to use (rush or smart). Execute mode requires rush or smart.                                                | `string`  | `"smart"`                                                                                            |
| `seal-code.promptTemplates`       | Named prompt templates for AI review. Use {{comments}} for formatted comments and {{files}} for affected file list.  | `object`  | See package.json                                                                                     |
| `seal-code.showAIQuickPick`       | Show quick pick menu for AI tool selection before sending to AI                                                      | `boolean` | `false`                                                                                              |
| `seal-code.terminalProfile`       | Terminal profile to use for AI reviews. 'default' uses VSCode terminal, 'tmux' runs in a tmux session per workspace. | `string`  | `"default"`                                                                                          |

<!-- configs -->

## ⌨️ Commands

<!-- commands -->

| Command                        | Title                                 |
| ------------------------------ | ------------------------------------- |
| `codeReview.addComment`        | Code Review: Add Review Comment       |
| `codeReview.editComment`       | Code Review: Edit Comment             |
| `codeReview.deleteComment`     | Code Review: Delete Comment           |
| `codeReview.filterByCategory`  | Code Review: Filter by Category       |
| `codeReview.toggleFileFilter`  | Code Review: Toggle Current File Only |
| `codeReview.exportMarkdown`    | Code Review: Export to Markdown       |
| `codeReview.exportHtml`        | Code Review: Export to HTML           |
| `codeReview.clearAll`          | Code Review: Clear All Comments       |
| `codeReview.filterByFilename`  | Code Review: Filter by Filename       |
| `codeReview.editCommentById`   | Code Review: Edit Comment             |
| `codeReview.deleteCommentById` | Code Review: Delete Comment           |
| `codeReview.sendToAI`          | Code Review: Send to AI Review        |
| `codeReview.sendSelectedToAI`  | Code Review: Send Selected to AI      |
| `codeReview.sendCategoryToAI`  | Code Review: Send Category to AI      |

<!-- commands -->

### Runtime AI Tool Selection

Enable the AI tool quick pick to choose different tools per review session:

```json
{
  "seal-code.showAIQuickPick": true
}
```

This allows parallel execution with different AI tools for comprehensive analysis.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🛠️ Development

Built with [Amp](https://ampcode.com/) and [Ralph](https://github.com/snarktank/ralph)

```bash
# Install dependencies
pnpm install

# Build
pnpm run build

# Watch mode
pnpm run dev

# Run tests
pnpm run test
```

## 💖 Show your support

Give a ⭐️ if this project helped you!

[![kofi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/dunghd)
[![paypal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/dunghd)
[![buymeacoffee](https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/dunghd)

## 📄 License

[MIT](./LICENSE.md) License © 2026 [Huynh Duc Dung](https://github.com/jellydn)
