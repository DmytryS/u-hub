import mongoose from 'mongoose'

const { Schema } = mongoose
const { ObjectId } = Schema

const valueSchema = new Schema(
  {
    sensor: {
      type: ObjectId,
      ref: 'sensor',
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at' },
  },
)

delete mongoose.connection.models.value
export default mongoose.model('value', valueSchema)
