import mongoose from 'mongoose'

const { Schema } = mongoose
const { ObjectId } = Schema

const shceduledActionSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  schedule: {
    type: String,
    required: true,
  },
  enabled: {
    type: Boolean,
    required: true,
  },
  action: {
    type: ObjectId,
    ref: 'action',
    required: true,
  }
})

delete mongoose.connection.models.scheduledAction
export default mongoose.model('scheduledAction', shceduledActionSchema)
