import mongoose from 'mongoose'

const { Schema } = mongoose
const { ObjectId } = Schema

const deviceSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  sensors: [{
    type: ObjectId,
    ref: 'Sensor'
  }],
})

delete mongoose.connection.models.Device

export default mongoose.model('Device', deviceSchema)
