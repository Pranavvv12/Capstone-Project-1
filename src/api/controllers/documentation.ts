import { Request, Response } from 'express'
import DocumentationService from '../../services/documentation'
import { DocumentationSyncError } from '../../interfaces/documentation'
import logger from '../../config/logger'

export default class DocumentationController {
  constructor (private documentationService: DocumentationService) {}

  public async sync (req: Request, res: Response): Promise<Response> {
    try {
      const result = await this.documentationService.sync({ title: req.body && req.body.title })
      return res.status(result.status === 'updated' ? 201 : 200).json(result)
    } catch (error) {
      if (error instanceof TypeError) {
        return res.status(400).json({ message: error.message })
      }

      if (error instanceof DocumentationSyncError && error.code === 'SOURCE_NOT_FOUND') {
        return res.status(404).json({ message: error.message })
      }

      logger.error(error)
      return res.status(500).json({ message: 'Documentation synchronization failed.' })
    }
  }
}
