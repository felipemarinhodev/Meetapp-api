import { isAfter } from 'date-fns';
import Meetup from '../models/Meetup';
import Subscribe from '../models/Subscribe';
import User from '../models/User';

class SubscribeController {
  async store(req, res) {
    const { id } = req.params;
    const meetup = await Meetup.findByPk(id);
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
      return res.json({ error: 'The user already subscribed in the Meetup' });
    }

    /**
     * Check if the user already subscribed in the Meetup
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

    if (mySubscribles) {
      return res.json({
        error: 'The user already subscribed in the another Meetup',
      });
    }

    const subscribe = await Subscribe.create({
      user_id,
      meetup_id: meetup.id,
      subscribe_in: new Date(),
    });
    return res.json(subscribe);
  }
}

export default new SubscribeController();
