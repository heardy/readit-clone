import { Request, Response, Router } from 'express';
import { AppDataSource } from '../data-source';
import Post from '../entity/Post';
import Sub from '../entity/Sub';

import auth from '../middleware/auth';

const createPost = async (req: Request, res: Response) => {
  const { title, body, sub } = req.body;

  const user = res.locals.user;

  if (title.trim() === '') {
    return res.status(400).json({ title: 'Title must not be empty' });
  }

  try {
    // find sub
    const subRecord = await AppDataSource.getRepository(Sub).findOneByOrFail({
      name: sub,
    });

    const post = new Post({ title, body, user, sub: subRecord });
    await post.save();

    return res.json(post);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

const router = Router();
router.post('/', auth, createPost);

export default router;
