import mongoose from 'mongoose'

const { Schema } = mongoose
const { ObjectId } = Schema

const conditionList = {
  values: ['<', '>', '>=', '<=', '!=', '=='],
  message: 'condition must be either of \'<\', \'>\', \'>=\', \'<=\', \'!=\', \'==\'',
}

const automaticActionSchema = new Schema({
  sensor: {
    type: ObjectId,
    ref: 'sensor',
    required: true,
  },
  valueToCompare: {
    type: Number,
    required: true,
  },
  condition: {
    type: String,
    enum: conditionList,
    required: true,
  },
  enabled: {
    type: Boolean, required: true,
  },
  action: {
    type: ObjectId,
    ref: 'action',
    required: true,
  }
})

delete mongoose.connection.models.automaticAction
export default mongoose.model('automaticAction', automaticActionSchema)
