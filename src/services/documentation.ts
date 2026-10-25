import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import {
  DocumentedRoute,
  DocumentationSyncError,
  DocumentationSyncInput,
  DocumentationSyncResult
} from '../interfaces/documentation'

interface DocumentationServiceOptions {
  repositoryRoot: string
  sourceDirectory?: string
  outputFile?: string
  apiPrefix?: string
}

export default class DocumentationService {
  private repositoryRoot: string
  private sourceDirectory: string
  private outputFile: string
  private apiPrefix: string

  constructor (options: DocumentationServiceOptions) {
    this.repositoryRoot = path.resolve(options.repositoryRoot)
    this.sourceDirectory = path.resolve(
      this.repositoryRoot,
      options.sourceDirectory || path.join('src', 'api', 'routes')
    )
    this.outputFile = path.resolve(
      this.repositoryRoot,
      options.outputFile || path.join('docs', 'api-reference.md')
    )
    this.apiPrefix = options.apiPrefix || '/api'
  }

  public async sync (input: DocumentationSyncInput): Promise<DocumentationSyncResult> {
    const content = await this.generate(input)
    const existing = await this.readOutput()
    const status = existing === content ? 'up-to-date' : 'updated'

    if (status === 'updated') {
      await fs.promises.mkdir(path.dirname(this.outputFile), { recursive: true })
      await fs.promises.writeFile(this.outputFile, content, 'utf8')
    }

    return this.result(status, content)
  }

  public async check (input: DocumentationSyncInput): Promise<DocumentationSyncResult> {
    const content = await this.generate(input)
    const existing = await this.readOutput()

    if (existing !== content) {
      throw new DocumentationSyncError(
        'DOCUMENTATION_STALE',
        'Generated documentation is missing or stale. Run npm run docs:sync.'
      )
    }

    return this.result('up-to-date', content)
  }

  public async discoverRoutes (): Promise<DocumentedRoute[]> {
    if (!await this.exists(this.sourceDirectory)) {
      throw new DocumentationSyncError(
        'SOURCE_NOT_FOUND',
        `Route source directory was not found: ${this.relative(this.sourceDirectory)}`
      )
    }

    const files = await this.findTypeScriptFiles(this.sourceDirectory)
    const routes: DocumentedRoute[] = []

    for (const file of files) {
      const source = await fs.promises.readFile(file, 'utf8')
      const baseMatch = /app\.use\(\s*['"]([^'"]+)['"]\s*,\s*route\s*\)/.exec(source)
      const basePath = baseMatch ? baseMatch[1] : ''
      const routePattern = /route\.(get|post|put|patch|delete)\(\s*['"]([^'"]*)['"]/gi
      let match: RegExpExecArray

      while ((match = routePattern.exec(source)) !== null) {
        routes.push({
          method: match[1].toUpperCase(),
          path: this.joinUrl(this.apiPrefix, basePath, match[2]),
          source: this.relative(file)
        })
      }
    }

    return routes.sort((left, right) => {
      return left.path.localeCompare(right.path) ||
        left.method.localeCompare(right.method) ||
        left.source.localeCompare(right.source)
    })
  }

  public render (input: DocumentationSyncInput, routes: DocumentedRoute[]): string {
    const lines = [
      `# ${input.title.trim()}`,
      '',
      '> Generated from `src/api/routes`. Run `npm run docs:sync` after route changes.',
      '',
      `Discovered routes: **${routes.length}**`,
      '',
      '| Method | Path | Source |',
      '|---|---|---|'
    ]

    if (routes.length === 0) {
      lines.push('| Not Found | Not Found | Not Found |')
    } else {
      routes.forEach(route => {
        lines.push(`| ${route.method} | \`${route.path}\` | \`${route.source}\` |`)
      })
    }

    return `${lines.join('\n')}\n`
  }

  private async generate (input: DocumentationSyncInput): Promise<string> {
    if (!input || typeof input.title !== 'string' || input.title.trim() === '') {
      throw new TypeError('title is required and must be a non-empty string')
    }

    const routes = await this.discoverRoutes()
    return this.render(input, routes)
  }

  private result (
    status: 'updated' | 'up-to-date',
    content: string
  ): DocumentationSyncResult {
    const routeCount = (content.match(/^\| (GET|POST|PUT|PATCH|DELETE) \|/gm) || []).length

    return {
      status,
      documentPath: this.relative(this.outputFile),
      routeCount,
      checksum: crypto.createHash('sha256').update(content).digest('hex')
    }
  }

  private async readOutput (): Promise<string | undefined> {
    if (!await this.exists(this.outputFile)) {
      return undefined
    }

    const content = await fs.promises.readFile(this.outputFile, 'utf8')
    return content.replace(/\r\n/g, '\n')
  }

  private async findTypeScriptFiles (directory: string): Promise<string[]> {
    const entries = await fs.promises.readdir(directory, { withFileTypes: true })
    const files: string[] = []

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        files.push(...await this.findTypeScriptFiles(fullPath))
      } else if (entry.isFile() && entry.name.endsWith('.ts')) {
        files.push(fullPath)
      }
    }

    return files.sort()
  }

  private joinUrl (...parts: string[]): string {
    const segments = parts
      .join('/')
      .split('/')
      .filter(segment => segment.length > 0)

    return `/${segments.join('/')}`
  }

  private relative (filePath: string): string {
    return path.relative(this.repositoryRoot, filePath).replace(/\\/g, '/')
  }

  private async exists (filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath)
      return true
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false
      }
      throw error
    }
  }
}
