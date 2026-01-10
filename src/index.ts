import { defineExtension } from 'reactive-vscode'
import { window, workspace } from 'vscode'
import { handleFileRename, registerCommands, updateCurrentFilePath } from './commands'
import { disposeDecorations, refreshAllDecorations, updateDecorations } from './decorations'
import { registerTreeView } from './treeView'

const { activate, deactivate } = defineExtension(() => {
  registerCommands()
  registerTreeView()

  refreshAllDecorations()
  updateCurrentFilePath()

  window.onDidChangeActiveTextEditor((editor) => {
    updateCurrentFilePath()
    if (editor) {
      updateDecorations(editor)
    }
  })

  workspace.onDidOpenTextDocument(() => {
    const editor = window.activeTextEditor
    if (editor) {
      updateDecorations(editor)
    }
  })

  workspace.onDidChangeTextDocument((event) => {
    const editor = window.activeTextEditor
    if (editor && editor.document === event.document) {
      updateDecorations(editor)
    }
  })

  workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration('code-notes')) {
      refreshAllDecorations()
    }
  })

  workspace.onDidRenameFiles((event) => {
    for (const { oldUri, newUri } of event.files) {
      handleFileRename(oldUri, newUri)
    }
  })

  return {
    dispose() {
      disposeDecorations()
    },
  }
})

export { activate, deactivate }
