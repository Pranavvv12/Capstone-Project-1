import DocumentationService from '../services/documentation'

const title = 'API Reference'
const service = new DocumentationService({ repositoryRoot: process.cwd() })
const checkOnly = process.argv.indexOf('--check') >= 0

async function run (): Promise<void> {
  const result = checkOnly
    ? await service.check({ title })
    : await service.sync({ title })

  process.stdout.write(
    `Documentation ${result.status}: ${result.documentPath} (${result.routeCount} routes, ${result.checksum})\n`
  )
}

run().catch(error => {
  process.stderr.write(`${error.message}\n`)
  process.exitCode = 1
})
