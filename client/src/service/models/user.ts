import { Schema, model, models, Model } from 'mongoose';
import { hashPassword } from '@/service/utils/tools';
import { PRICE_SCALE } from '@/constants/common';
import { UserModelSchema } from '@/types/mongoSchema';

const UserSchema = new Schema({
  username: {
    // It can be a mobile phone/email. New verification only uses mobile phones.
    type: String,
    required: true,
    unique: true // unique
  },
  password: {
    type: String,
    required: true,
    set: (val: string) => hashPassword(val),
    get: (val: string) => hashPassword(val),
    select: false
  },
  createTime: {
    type: Date,
    default: () => new Date()
  },
  avatar: {
    type: String,
    default: '/icon/human.png'
  },
  balance: {
    type: Number,
    default: 2 * PRICE_SCALE
  },
  inviterId: {
    // Who invited to register?
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  promotionRate: {
    type: Number,
    default: 15
  },
  limit: {
    exportKbTime: {
      // Every half hour
      type: Date
    }
  },
  openaiAccount: {
    type: {
      key: String,
      baseUrl: String
    }
  }
});

export const User: Model<UserModelSchema> = models['user'] || model('user', UserSchema);
