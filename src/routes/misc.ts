import { Request, Response, Router } from 'express';
import { AppDataSource } from '../data-source';
import Comment from '../entity/Comment';
import Post from '../entity/Post';
import User from '../entity/User';
import Vote from '../entity/Vote';
import auth from '../middleware/auth';
import user from '../middleware/user';

const vote = async (req: Request, res: Response) => {
  const { identifier, slug, commentIdentifier, value } = req.body;

  // Validate vote value
  if (![-1, 0, 1].includes(value))
    return res.status(400).json({ value: 'Value must be -1, 0 or 1' });

  try {
    const user: User = res.locals.user;

    let post = await AppDataSource.getRepository(Post).findOneByOrFail({
      identifier,
      slug,
    });

    let vote: Vote | null;
    let comment: Comment | undefined;

    if (commentIdentifier) {
      // find vote by comment

      comment = await AppDataSource.getRepository(Comment).findOneByOrFail({
        identifier: commentIdentifier,
      });

      vote = await AppDataSource.getRepository(Vote)
        .createQueryBuilder('vote')
        .leftJoinAndSelect('vote.user', 'user')
        .leftJoinAndSelect('vote.comment', 'comment')
        .where('user.username = :username and comment.id = :commentId', {
          username: user.username,
          commentId: comment.id,
        })
        .getOne();

      console.log('>>>comment vote', vote);
    } else {
      vote = await AppDataSource.getRepository(Vote)
        .createQueryBuilder('vote')
        .leftJoinAndSelect('vote.user', 'user')
        .leftJoinAndSelect('vote.post', 'post')
        .where('user.username = :username and post.id = :postId', {
          username: user.username,
          postId: post.id,
        })
        .getOne();
    }

    if (!vote && value === 0) {
      // if no vote and value = 0 return error
      return res.status(404).json({ error: 'Vote not found' });
    } else if (!vote) {
      // If no vote create it
      vote = new Vote({ user, value });
      if (comment) vote.comment = comment;
      else vote.post = post;
      await vote.save();
    } else if (value === 0) {
      // If vote exists and value = 0 remove vote from DB
      await vote.remove();
    } else if (vote.value !== value) {
      // If vote and value has changed, update vote
      vote.value = value;
      await vote.save();
    }

    post = await AppDataSource.getRepository(Post).findOneOrFail({
      where: {
        identifier,
        slug,
      },
      relations: ['comments', 'comments.votes', 'sub', 'votes'],
    });
    post.setUserVote(user);
    post.comments.forEach(c => c.setUserVote(user));

    return res.json(post);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

const router = Router();
router.post('/vote', user, auth, vote);

export default router;
