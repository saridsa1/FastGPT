// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/service/response';
import { connectToDatabase } from '@/service/mongo';
import { User } from '@/service/models/user';
import { generateToken, setCookie } from '@/service/utils/tools';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new Error('Missing parameter');
    }

    await connectToDatabase();

    const authUser = await User.findOne({
      username
    });
    if (!authUser) {
      throw new Error('User is not registered');
    }

    const user = await User.findOne({
      username,
      password
    });

    if (!user) {
      throw new Error('password error');
    }

    const token = generateToken(user._id);
    setCookie(res, token);

    jsonRes(res, {
      data: {
        user,
        token
      }
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
