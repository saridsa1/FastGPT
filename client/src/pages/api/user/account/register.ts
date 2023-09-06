// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/service/response';
import { User } from '@/service/models/user';
import { connectToDatabase } from '@/service/mongo';
import { generateToken, setCookie } from '@/service/utils/tools';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { username, code, password, inviterId } = req.body;

    if (!username || !code || !password) {
      throw new Error('Invalid request');
    }

    await connectToDatabase();

    const authRepeat = await User.findOne({
      username
    });

    if (authRepeat) {
      throw new Error('User already exists');
    }

    const response = await User.create({
      username,
      password,
      inviterId: inviterId ? inviterId : undefined
    });

    const user = await User.findById(response._id);

    if (!user) {
      throw new Error('User not found');
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
