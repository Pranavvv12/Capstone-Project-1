export interface DocumentationSyncInput {
  title: string
}

export interface DocumentedRoute {
  method: string
  path: string
  source: string
}

export interface DocumentationSyncResult {
  status: 'updated' | 'up-to-date'
  documentPath: string
  routeCount: number
  checksum: string
}

export class DocumentationSyncError extends Error {
  code: 'SOURCE_NOT_FOUND' | 'DOCUMENTATION_STALE'

  constructor (code: 'SOURCE_NOT_FOUND' | 'DOCUMENTATION_STALE', message: string) {
    super(message)
    this.code = code
    Object.setPrototypeOf(this, DocumentationSyncError.prototype)
  }
}
