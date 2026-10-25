import { Router } from 'express'
import user from './routes/user'
import documentation from './routes/documentation'

export default (): Router => {
  const app = Router()

  user(app)
  documentation(app)

  return app
}
