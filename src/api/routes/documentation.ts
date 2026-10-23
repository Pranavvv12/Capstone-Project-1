import { Request, Response, Router } from 'express'
import DocumentationController from '../controllers/documentation'
import DocumentationService from '../../services/documentation'

const route = Router()
const service = new DocumentationService({ repositoryRoot: process.cwd() })
const controller = new DocumentationController(service)

export default (app: Router): void => {
  app.use('/documentation', route)
  route.post('/sync', (req: Request, res: Response) => controller.sync(req, res))
}
