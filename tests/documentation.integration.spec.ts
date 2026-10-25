import fs from 'fs'
import os from 'os'
import path from 'path'
import DocumentationService from '../src/services/documentation'

const rimraf = require('rimraf')

describe('DocumentationService filesystem integration', () => {
  let repositoryRoot: string
  let routeDirectory: string

  beforeEach(() => {
    repositoryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'documentation-sync-'))
    routeDirectory = path.join(repositoryRoot, 'src', 'api', 'routes')
    fs.mkdirSync(routeDirectory, { recursive: true })
  })

  afterEach(() => {
    rimraf.sync(repositoryRoot)
  })

  it('discovers routes and keeps synchronized output stable', async () => {
    fs.writeFileSync(
      path.join(routeDirectory, 'user.ts'),
      [
        "const route = Router()",
        "app.use('/users', route)",
        "route.get('/', handler)",
        "route.post('/invite', handler)"
      ].join('\n')
    )
    const service = new DocumentationService({ repositoryRoot })

    const first = await service.sync({ title: 'API Reference' })
    const second = await service.sync({ title: 'API Reference' })
    const output = fs.readFileSync(path.join(repositoryRoot, 'docs', 'api-reference.md'), 'utf8')

    expect(first.status).toBe('updated')
    expect(first.routeCount).toBe(2)
    expect(second.status).toBe('up-to-date')
    expect(second.checksum).toBe(first.checksum)
    expect(output).toContain('| GET | `/api/users` |')
    expect(output).toContain('| POST | `/api/users/invite` |')
  })

  it('fails a freshness check when output is stale', async () => {
    fs.writeFileSync(path.join(routeDirectory, 'health.ts'), "route.get('/health', handler)")
    fs.mkdirSync(path.join(repositoryRoot, 'docs'))
    fs.writeFileSync(path.join(repositoryRoot, 'docs', 'api-reference.md'), 'stale')
    const service = new DocumentationService({ repositoryRoot })

    await expect(service.check({ title: 'API Reference' })).rejects.toMatchObject({
      code: 'DOCUMENTATION_STALE'
    })
  })

  it('accepts Git checkouts with Windows line endings', async () => {
    fs.writeFileSync(path.join(routeDirectory, 'health.ts'), "route.get('/health', handler)")
    const service = new DocumentationService({ repositoryRoot })

    await service.sync({ title: 'API Reference' })
    const outputPath = path.join(repositoryRoot, 'docs', 'api-reference.md')
    const output = fs.readFileSync(outputPath, 'utf8')
    fs.writeFileSync(outputPath, output.replace(/\n/g, '\r\n'))

    await expect(service.check({ title: 'API Reference' })).resolves.toMatchObject({
      status: 'up-to-date',
      routeCount: 1
    })
  })

  it('fails explicitly when the route source is missing', async () => {
    rimraf.sync(routeDirectory)
    const service = new DocumentationService({ repositoryRoot })

    await expect(service.sync({ title: 'API Reference' })).rejects.toEqual(
      expect.objectContaining({
        code: 'SOURCE_NOT_FOUND'
      })
    )
  })

  it('rejects a missing title', async () => {
    const service = new DocumentationService({ repositoryRoot })

    await expect(service.sync({ title: '' })).rejects.toThrow(
      'title is required and must be a non-empty string'
    )
  })
})
