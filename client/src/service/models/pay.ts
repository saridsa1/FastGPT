import { Schema, model, models, Model } from 'mongoose';
import { PaySchema as PayType } from '@/types/mongoSchema';
const PaySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  createTime: {
    type: Date,
    default: () => new Date()
  },
  price: {
    type: Number,
    required: true
  },
  orderId: {
    type: String,
    required: true
  },
  status: {
    // status of payment
    type: String,
    default: 'NOTPAY',
    enum: ['SUCCESS', 'REFUND', 'NOTPAY', 'CLOSED']
  }
});

export const Pay: Model<PayType> = models['pay'] || model('pay', PaySchema);
