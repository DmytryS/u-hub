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
    ref: 'sensor'
  }],
})

delete mongoose.connection.models.device

export default mongoose.model('device', deviceSchema)
