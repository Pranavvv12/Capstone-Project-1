import DocumentationService from '../src/services/documentation'

describe('DocumentationService rendering', () => {
  const service = new DocumentationService({ repositoryRoot: process.cwd() })

  it('renders routes in Markdown', () => {
    const output = service.render(
      { title: 'API Reference' },
      [{ method: 'GET', path: '/api/users', source: 'src/api/routes/user.ts' }]
    )

    expect(output).toContain('# API Reference')
    expect(output).toContain('| GET | `/api/users` | `src/api/routes/user.ts` |')
    expect(output).toContain('Discovered routes: **1**')
  })

  it('marks an empty route set as Not Found', () => {
    const output = service.render({ title: 'API Reference' }, [])

    expect(output).toContain('Discovered routes: **0**')
    expect(output).toContain('| Not Found | Not Found | Not Found |')
  })
})
