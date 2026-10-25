jest.mock('../src/config/logger', () => ({
  error: jest.fn()
}))

import DocumentationController from '../src/api/controllers/documentation'

describe('DocumentationController', () => {
  function response () {
    const res: any = {}
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    return res
  }

  it('returns 400 when title is missing', async () => {
    const service: any = {
      sync: jest.fn().mockRejectedValue(
        new TypeError('title is required and must be a non-empty string')
      )
    }
    const controller = new DocumentationController(service)
    const res = response()

    await controller.sync({ body: {} } as any, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      message: 'title is required and must be a non-empty string'
    })
  })

  it('returns the synchronization result', async () => {
    const result = {
      status: 'updated',
      documentPath: 'docs/api-reference.md',
      routeCount: 2,
      checksum: 'checksum'
    }
    const service: any = { sync: jest.fn().mockResolvedValue(result) }
    const controller = new DocumentationController(service)
    const res = response()

    await controller.sync({ body: { title: 'API Reference' } } as any, res)

    expect(service.sync).toHaveBeenCalledWith({ title: 'API Reference' })
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith(result)
  })
})
