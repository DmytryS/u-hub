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
  actions: [{
    type: ObjectId,
    ref: 'Action',
    required: true,
  }]
})

delete mongoose.connection.models.ScheduledAction
export default mongoose.model('ScheduledAction', shceduledActionSchema)
