// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/service/response';
import { connectToDatabase, User, promotionRecord } from '@/service/mongo';
import { authUser } from '@/service/utils/auth';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();
    const { userId } = await authUser({ req, authToken: true });

    const invitedAmount = await User.countDocuments({
      inviterId: userId
    });

    // Calculate the cumulative sum
    const countHistory: { totalAmount: number }[] = await promotionRecord.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          amount: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null, // Grouping condition, use null here to indicate no grouping
          totalAmount: { $sum: '$amount' } // Calculate the sum of the amount field
        }
      },
      {
        $project: {
          _id: false, // exclude _id field
          totalAmount: true // Only return the totalAmount field
        }
      }
    ]);

    jsonRes(res, {
      data: {
        invitedAmount,
        earningsAmount: countHistory[0]?.totalAmount || 0
      }
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
