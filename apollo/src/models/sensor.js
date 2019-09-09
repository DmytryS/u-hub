import mongoose from 'mongoose'

const { Schema } = mongoose
const { ObjectId } = Schema

const sensorSchema = new Schema({
  type: {
    type: String,
    required: true,
  },
  device: {
    type: ObjectId,
    ref: 'device',
    required: true,
  },
  values: [{
    type: ObjectId,
    ref: 'value'
  }]
})

delete mongoose.connection.models.sensor

export default mongoose.model('sensor', sensorSchema)
