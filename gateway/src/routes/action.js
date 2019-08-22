import express from 'express'
import { action } from '../services'

const router = express.Router()

router.route('/actions')
  .get(action.getActions)
  .post(action.createAction)

router.route('/actions/:actionId')
  .put(action.updateAction)
  .delete(action.deleteAction)

export default router
