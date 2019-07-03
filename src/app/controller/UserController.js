import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async get(req, res) {
    const users = User.findAll();
    return res.json({ users });
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Request fails' });
    }

    const userExist = await User.findOne({ where: { email: req.body.email } });
    if (userExist) {
      return res.status(400).json({ error: 'User already exist.' });
    }
    console.log(`Body: ${JSON.stringify(req.body)}`);

    try {
      const user = await User.create(req.body);

      return res.json(user);
    } catch (err) {
      return res.status(401).json({ error: err.body });
    }
  }
}

export default new UserController();
