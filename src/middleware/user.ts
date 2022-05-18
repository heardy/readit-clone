import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { AppDataSource } from '../data-source';
import User from '../entity/User';

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    if (!token) return next();

    const { username }: any = jwt.verify(token, process.env.JWT_SECRET!);

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ username });

    res.locals.user = user;

    return next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ error: 'Unauthenticated' });
  }
};
