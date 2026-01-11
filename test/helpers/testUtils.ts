import type { Comment } from '../../src/types'
import { TextDecoder, TextEncoder } from 'node:util'

function getPath(uri: any): string {
  if (typeof uri === 'string') {
    return uri
  }
  return uri.fsPath || uri.toString() || String(uri)
}

export class MockFileSystem {
  private files = new Map<string, Uint8Array>()
  private stats = new Map<string, { type: 'file' | 'directory' }>()

  async readFile(uri: any): Promise<Uint8Array> {
    const path = getPath(uri)
    const content = this.files.get(path)
    if (content === undefined) {
      throw new Error(`File not found: ${path}`)
    }
    return content
  }

  async writeFile(uri: any, content: Uint8Array): Promise<void> {
    const path = getPath(uri)
    this.files.set(path, content)
    this.stats.set(path, { type: 'file' })
  }

  async stat(uri: any): Promise<{ type: number, ctime: number, mtime: number, size: number }> {
    const path = getPath(uri)
    const stat = this.stats.get(path)
    if (stat === undefined) {
      throw new Error(`Path not found: ${path}`)
    }
    const content = this.files.get(path)
    return {
      type: stat.type === 'file' ? 1 : 2, // 1 = file, 2 = directory (FileStat.FileType enum)
      ctime: Date.now(),
      mtime: Date.now(),
      size: content?.length ?? 0,
    }
  }

  async createDirectory(uri: any): Promise<void> {
    const path = getPath(uri)
    this.stats.set(path, { type: 'directory' })
  }

  async readDirectory(): Promise<any[]> {
    return []
  }

  async delete(): Promise<void> {
    // No-op for tests
  }

  async rename(): Promise<void> {
    // No-op for tests
  }

  async copy(): Promise<void> {
    // No-op for tests
  }

  isWritableFileSystem = () => true

  setFile(path: string, content: string): void {
    this.files.set(path, new TextEncoder().encode(content))
    this.stats.set(path, { type: 'file' })
  }

  getFile(path: string): string | undefined {
    const content = this.files.get(path)
    return content ? new TextDecoder().decode(content) : undefined
  }

  fileExists(path: string): boolean {
    return this.stats.get(path)?.type === 'file'
  }

  directoryExists(path: string): boolean {
    return this.stats.get(path)?.type === 'directory'
  }

  clear(): void {
    this.files.clear()
    this.stats.clear()
  }
}

export function createMockWorkspace(mockFs: MockFileSystem) {
  return {
    workspaceFolders: [
      {
        uri: {
          fsPath: '/test/workspace',
          toString: () => '/test/workspace',
        },
      },
    ],
    fs: mockFs,
  }
}

export function createEmptyWorkspace() {
  return {
    workspaceFolders: [],
    fs: new MockFileSystem(),
  }
}

export function createMockCommentsFile(comments: Comment[]): string {
  return JSON.stringify(comments, null, 2)
}

export function createInvalidJsonContent(): string {
  return '{ invalid json content'
}

export function createEmptyJsonArray(): string {
  return '[]'
}
