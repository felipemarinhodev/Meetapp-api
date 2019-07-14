import { isAfter } from 'date-fns';
import { Op } from 'sequelize';
import Meetup from '../models/Meetup';
import Subscribe from '../models/Subscribe';
import User from '../models/User';
import Mail from '../../lib/Mail';
import File from '../models/File';

class SubscribeController {
  async store(req, res) {
    const { id } = req.params;
    const meetup = await Meetup.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email'],
        },
      ],
    });
    const user_id = req.userId;

    if (meetup.user_id === user_id) {
      return res
        .status(400)
        .json({ error: 'You already are owner this meetup.' });
    }

    if (isAfter(new Date(), meetup.scheduling)) {
      return res.status(400).json({
        error: 'You can not subscribe to a meeting that has already happened.',
      });
    }

    const subscribes = await Subscribe.findAll({
      where: { meetup_id: meetup.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
        },
      ],
    });

    /**
     * Check if the user already subscribed in the Meetup
     */
    if (subscribes.find(subscribe => subscribe.user_id === user_id)) {
      return res
        .status(400)
        .json({ error: 'The user already subscribed in the Meetup' });
    }

    /**
     * The user already subscribed in the another Meetup
     */
    const mySubscribles = await Subscribe.findAll({
      where: {
        user_id,
      },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          where: { scheduling: meetup.scheduling },
        },
      ],
    });

    if (mySubscribles.length > 0) {
      return res.status(400).json({
        error: 'The user already subscribed in the another Meetup',
      });
    }

    const subscribe = await Subscribe.create({
      user_id,
      meetup_id: meetup.id,
      subscribe_in: new Date(),
    });

    const member = await User.findByPk(req.userId);
    const subject = `New member for Meetup: ${meetup.title}`;
    const text = `The ${member.name} joined for the meetup ${meetup.title}. His email is ${member.email}.`;
    await Mail.sendMail({
      to: `${meetup.user.name} <${meetup.user.email}>`,
      subject,
      text,
    });

    return res.json(subscribe);
  }

  async index(req, res) {
    const subscribed = await Subscribe.findAll({
      attributes: ['subscribe_in'],
      include: [
        {
          model: User,
          as: 'user',
          where: {
            id: req.userId,
          },
          attributes: [],
        },
        {
          model: Meetup,
          as: 'meetup',
          attributes: ['id', 'description', 'location', 'scheduling'],
          include: [
            {
              model: File,
              as: 'banner',
              attributes: ['id', 'path', 'url'],
            },
          ],
          where: {
            scheduling: {
              [Op.gt]: new Date().toISOString(),
            },
          },
        },
      ],
      order: [['meetup', 'scheduling']],
    });

    return res.json({ subscribed });
  }
}

export default new SubscribeController();
