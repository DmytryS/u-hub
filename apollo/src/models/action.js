import mongoose from 'mongoose'

const { Schema } = mongoose
const { ObjectId } = Schema

const actionSchema = new Schema({
  target: {
    type: ObjectId,
    ref: 'Sensor',
    required: true,
  },
  valueToChangeOn: {
    type: String,
    required: true,
  },
})

delete mongoose.connection.models.Action
export default mongoose.model('Action', actionSchema)
