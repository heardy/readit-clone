import { Request, Response, Router } from "express"
import { validate } from "class-validator";

import { AppDataSource } from "../data-source";
import { User } from "../entity/User";

const register = async (req: Request, res: Response) => {
  const {email, username, password} = req.body;

  try {
    const userRepository = AppDataSource.getRepository(User)

    // TODO: Validate data
    let errors: any = {};
    const emailUser = await userRepository.findOneBy({ email });
    const usernameUser = await userRepository.findOneBy({ username });

    if (emailUser) errors.email = 'Email is already taken';
    if (usernameUser) errors.username = 'Username is already taken';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    // TODO: Create the user
    const user = new User({ email, username, password });

    errors = await validate(user);

    if (errors.length > 0) return res.status(400).json({ errors })

    await user.save()

    // TODO: Return the user
    return res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
}

const router = Router();
router.post('/register', register);

export default router;