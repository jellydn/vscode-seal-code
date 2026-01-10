# code-notes

<a href="https://marketplace.visualstudio.com/items?itemName=jellydn.code-notes" target="__blank"><img src="https://img.shields.io/visual-studio-marketplace/v/jellydn.code-notes.svg?color=eee&amp;label=VS%20Code%20Marketplace&logo=visual-studio-code" alt="Visual Studio Marketplace Version" /></a>
<a href="https://kermanx.github.io/reactive-vscode/" target="__blank"><img src="https://img.shields.io/badge/made_with-reactive--vscode-%23007ACC?style=flat&labelColor=%23229863"  alt="Made with reactive-vscode" /></a>

## Development

Built with [amp](https://ampcode.com/) and [ralph](https://github.com/snarktank/ralph)

## Configurations

<!-- configs -->

| Key                                | Description                                            | Type      | Default                                                                                              |
| ---------------------------------- | ------------------------------------------------------ | --------- | ---------------------------------------------------------------------------------------------------- |
| `code-notes.showInlineDecorations` | Show inline text decorations (after-line text preview) | `boolean` | `true`                                                                                               |
| `code-notes.showGutterIcons`       | Show gutter icons for comments                         | `boolean` | `true`                                                                                               |
| `code-notes.showLineBackground`    | Show colored background on commented lines             | `boolean` | `true`                                                                                               |
| `code-notes.categoryColors`        | Custom colors for each comment category                | `object`  | `{"bug":"#f44336","question":"#2196f3","suggestion":"#4caf50","nitpick":"#ff9800","note":"#9e9e9e"}` |

<!-- configs -->

## Commands

<!-- commands -->

| Command                       | Title                                 |
| ----------------------------- | ------------------------------------- |
| `codeReview.addComment`       | Code Review: Add Review Comment       |
| `codeReview.editComment`      | Code Review: Edit Comment             |
| `codeReview.deleteComment`    | Code Review: Delete Comment           |
| `codeReview.filterByCategory` | Code Review: Filter by Category       |
| `codeReview.toggleFileFilter` | Code Review: Toggle Current File Only |
| `codeReview.exportMarkdown`   | Code Review: Export to Markdown       |
| `codeReview.exportHtml`       | Code Review: Export to HTML           |
| `codeReview.clearAll`         | Code Review: Clear All Comments       |

<!-- commands -->

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/jellydn/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/jellydn/static/sponsors.png'/>
  </a>
</p>

## License

[MIT](./LICENSE.md) License © 2026 [Huynh Duc Dung](https://github.com/jellydn)
