/* knowledge base of the model */
import { Schema, model, models, Model as MongoModel } from 'mongoose';
import { TrainingDataSchema as TrainingDateType } from '@/types/mongoSchema';
import { TrainingTypeMap } from '@/constants/plugin';

// pgList and vectorList, only one of them will work
const TrainingDataSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  kbId: {
    type: Schema.Types.ObjectId,
    ref: 'kb',
    required: true
  },
  expireAt: {
    type: Date,
    default: () => new Date()
  },
  lockTime: {
    type: Date,
    default: () => new Date('2000/1/1')
  },
  mode: {
    type: String,
    enum: Object.keys(TrainingTypeMap),
    required: true
  },
  vectorModel: {
    type: String,
    required: true,
    default: 'text-embedding-ada-002'
  },
  prompt: {
    //qa split prompt
    type: String,
    default: ''
  },
  q: {
    type: String,
    default: ''
  },
  a: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    default: ''
  },
  file_id: {
    type: String,
    default: ''
  }
});

try {
  TrainingDataSchema.index({ lockTime: 1 });
  TrainingDataSchema.index({ userId: 1 });
  TrainingDataSchema.index({ expireAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 });
} catch (error) {
  console.log(error);
}

export const TrainingData: MongoModel<TrainingDateType> =
  models['trainingData'] || model('trainingData', TrainingDataSchema);
