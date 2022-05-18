import { NextFunction, Request, Response, Router } from 'express';
import { isEmpty } from 'class-validator';
import { getRepository } from 'typeorm';
import multer, { FileFilterCallback } from 'multer';
import { unlinkSync } from 'fs';

import User from '../entity/User';
import Sub from '../entity/Sub';
import auth from '../middleware/auth';
import user from '../middleware/user';
import Post from '../entity/Post';
import { makeId } from '../util/helpers';
import path from 'path';

const createSub = async (req: Request, res: Response) => {
  const { name, title, description } = req.body;

  const user: User = res.locals.user;

  try {
    let errors: any = {};

    if (isEmpty(name)) errors.name = 'Name must not be empty';
    if (isEmpty(title)) errors.title = 'Title must not be empty';

    const sub = await getRepository(Sub)
      .createQueryBuilder('sub')
      .where('lower(sub.name) = :name', { name: name.toLowerCase() })
      .getOne();

    console.log('sub', sub);

    if (sub) errors.name = 'Sub exists already';

    if (Object.keys(errors).length > 0) throw errors;
  } catch (err) {
    return res.status(400).json(err);
  }

  try {
    const sub = new Sub({ name, description, title, user });
    await sub.save();

    return res.json(sub);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wring' });
  }
};

const getSub = async (req: Request, res: Response) => {
  const name = req.params.name;

  try {
    const sub = await Sub.findOneOrFail({ name });
    const posts = await Post.find({
      where: { sub },
      order: { createdAt: 'DESC' },
      relations: ['comments', 'votes'],
    });

    sub.posts = posts;

    if (res.locals.user) {
      sub.posts.forEach(p => p.setUserVote(res.locals.user));
    }

    return res.json(sub);
  } catch (err) {
    console.log(err);
    return res.status(404).json({ error: 'Sub not found' });
  }
};

const ownSub = async (req: Request, res: Response, next: NextFunction) => {
  const user: User = res.locals.user;

  try {
    const sub = await Sub.findOneOrFail({ where: { name: req.params.name } });

    if (sub.username !== user.username) {
      return res.status(403).json({ error: "You don't own this sub" });
    }

    res.locals.sub = sub;

    return next();
  } catch (err) {
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

const upload = multer({
  storage: multer.diskStorage({
    destination: 'public/images',
    filename: (_, file, callback) => {
      const name = makeId(15);
      callback(null, name + path.extname(file.originalname)); // eg. 1232353 + .png
    },
  }),
  fileFilter: (_, file: any, callback: FileFilterCallback) => {
    if (['image/jpeg', 'image/png'].includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('File not an image'));
    }
  },
});

const uploadSubImage = async (req: Request, res: Response) => {
  const sub: Sub = res.locals.sub;
  try {
    const type = req.body.type;
    console.log('req.file', req.file);

    if (!['image', 'banner'].includes(type)) {
      // @ts-ignore
      unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Invalid type' });
    }

    let oldImageUrn: string = '';
    // @ts-ignore
    const { filename } = req.file;
    if (type === 'image') {
      oldImageUrn = sub.imageUrn || '';
      sub.imageUrn! = filename;
    } else {
      oldImageUrn = sub.bannerUrn || '';
      sub.bannerUrn = filename;
    }
    await sub.save();

    if (oldImageUrn != '') unlinkSync(path.join('public/images/', oldImageUrn));

    return res.json(sub);
  } catch (err) {
    return res.status(500).json();
  }
};

const router = Router();
router.post('/', user, auth, createSub);
router.get('/:name', user, getSub);
router.post(
  '/:name/image',
  user,
  auth,
  ownSub,
  upload.single('file'),
  uploadSubImage
);

export default router;
