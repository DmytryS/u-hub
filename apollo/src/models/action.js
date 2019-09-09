import mongoose from 'mongoose'

const { Schema } = mongoose
const { ObjectId } = Schema

const emitterType = {
  values: ['dutomaticAction', 'scheduledAction'],
  message: 'node type must be either of \'AutomaticAction\' or \'ScheduledAction\'',
}

const actionSchema = new Schema({
  emitter: {
    type: ObjectId,
    refPath: 'emitterType',
    required: true,
  },
  emitterType: {
    type: String,
    enum: emitterType,
    required: true,
  },
  target: {
    type: ObjectId,
    ref: 'device.sensor',
    required: true,
  },
  valueToChangeOn: {
    type: String,
    required: true,
  },
})

delete mongoose.connection.models.action
export default mongoose.model('action', actionSchema)
