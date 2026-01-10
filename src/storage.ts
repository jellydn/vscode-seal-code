import { Uri, window, workspace } from 'vscode'

const CODEREVIEW_DIR = '.codereview'
const COMMENTS_FILE = 'comments.json'

export async function getCodeReviewDir(): Promise<Uri | undefined> {
  const workspaceFolder = workspace.workspaceFolders?.[0]
  if (!workspaceFolder) {
    return undefined
  }
  return Uri.joinPath(workspaceFolder.uri, CODEREVIEW_DIR)
}

export async function getCommentsFilePath(): Promise<Uri | undefined> {
  const dir = await getCodeReviewDir()
  if (!dir) {
    return undefined
  }
  return Uri.joinPath(dir, COMMENTS_FILE)
}

export async function ensureCodeReviewDir(): Promise<Uri | undefined> {
  const dir = await getCodeReviewDir()
  if (!dir) {
    window.showErrorMessage('No workspace folder found')
    return undefined
  }

  try {
    await workspace.fs.stat(dir)
  }
  catch {
    await workspace.fs.createDirectory(dir)
    await promptAddToGitignore()
  }

  return dir
}

export async function ensureCommentsFile(): Promise<Uri | undefined> {
  const dir = await ensureCodeReviewDir()
  if (!dir) {
    return undefined
  }

  const commentsFile = Uri.joinPath(dir, COMMENTS_FILE)
  try {
    await workspace.fs.stat(commentsFile)
  }
  catch {
    await workspace.fs.writeFile(commentsFile, new TextEncoder().encode('[]'))
  }

  return commentsFile
}

async function promptAddToGitignore(): Promise<void> {
  const workspaceFolder = workspace.workspaceFolders?.[0]
  if (!workspaceFolder) {
    return
  }

  const response = await window.showInformationMessage(
    `Add ${CODEREVIEW_DIR}/ to .gitignore?`,
    'Yes',
    'No',
  )

  if (response === 'Yes') {
    const gitignorePath = Uri.joinPath(workspaceFolder.uri, '.gitignore')
    let content = ''

    try {
      const existingContent = await workspace.fs.readFile(gitignorePath)
      content = new TextDecoder().decode(existingContent)
    }
    catch {
      // File doesn't exist, will create it
    }

    if (!content.includes(`${CODEREVIEW_DIR}/`)) {
      const newLine = content.endsWith('\n') || content === '' ? '' : '\n'
      content += `${newLine}${CODEREVIEW_DIR}/\n`
      await workspace.fs.writeFile(gitignorePath, new TextEncoder().encode(content))
    }
  }
}
