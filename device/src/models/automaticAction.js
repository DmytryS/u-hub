import mongoose from 'mongoose';

const { Schema } = mongoose;
const { ObjectId } = Schema;

const conditionList = {
  values: ['<', '>', '>=', '<=', '!=', '=='],
  message: "condition must be either of '<', '>', '>=', '<=', '!=', '=='",
};

const automaticActionSchema = new Schema({
  sensor: {
    type: ObjectId,
    ref: 'Sensor',
    required: true,
  },
  valueToCompare: {
    type: Number,
    required: true,
  },
  condition: {
    type: String,
    enum: conditionList,
    required: true,
  },
  enabled: {
    type: Boolean, required: true,
  },
});

delete mongoose.connection.models.AutomaticAction;
export default mongoose.model('AutomaticAction', automaticActionSchema);
