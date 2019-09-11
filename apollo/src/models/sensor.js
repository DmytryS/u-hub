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
    ref: 'Device',
    required: true,
  },
  values: [{
    type: ObjectId,
    ref: 'Value'
  }]
})

delete mongoose.connection.models.Sensor

export default mongoose.model('Sensor', sensorSchema)
