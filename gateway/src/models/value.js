import mongoose from 'mongoose'

const { Schema } = mongoose
const { ObjectId } = Schema

const valueSchema = new Schema(
  {
    sensor: {
      type: ObjectId,
      ref: 'Sensor',
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      // enum: nodeTypes,
      requiered: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at' },
  },
)

delete mongoose.connection.models.Value
export default mongoose.model('Value', valueSchema)
