import * as Yup from 'yup';
import { isBefore, parseISO, isAfter, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';

import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupController {
  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      scheduling: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { title, description, location, scheduling } = req.body;

    const user_id = req.userId;
    const banner_id = 1;

    const date = parseISO(scheduling);

    if (isBefore(date, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    const meetup = await Meetup.create({
      title,
      description,
      location,
      scheduling,
      user_id,
      banner_id,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      scheduling: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Request fails' });
    }

    const currentUser = req.userId;
    const { id } = req.params;
    const meetup = await Meetup.findByPk(id);

    if (isAfter(new Date(), meetup.scheduling)) {
      return res.status(400).json({
        error: 'Meetup already happens and cannot be edit.',
      });
    }

    if (currentUser !== meetup.user_id) {
      return res
        .status(400)
        .json({ error: 'Only the owner can edit your Meetup.' });
    }

    // if (req.file) {
    //   const { originalname: name, filename: path } = req.file;

    //   const file = await File.create({ name, path });

    //   console.log(JSON.stringify(file));
    // }

    const { title, description, location, scheduling } = await meetup.update(
      req.body
    );

    return res.json({ title, description, location, scheduling });
  }

  async index(req, res) {
    const { page = 1 } = req.query;
    const { scheduling } = req.query;

    const parseDate = parseISO(scheduling);

    console.log(`scheduling: ${scheduling}`);

    const meetups = await Meetup.findAll({
      where: {
        user_id: req.userId,
        scheduling: {
          [Op.between]: [startOfDay(parseDate), endOfDay(parseDate)],
        },
      },
      order: ['scheduling'],
      attributes: ['id', 'title', 'description', 'location', 'scheduling'],
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: File,
          as: 'banner',
          attributes: ['name', 'url', 'path'],
        },
      ],
    });

    return res.json(meetups);
  }

  async delete(req, res) {
    const { id } = req.params;
    console.log(`id: ${id}`);
    const meetup = await Meetup.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    if (!meetup) {
      return res.status(400).json({ error: 'This meetup is not found' });
    }

    if (isAfter(new Date(), meetup.scheduling)) {
      return res.status(400).json({
        error: 'Meetup already happens and cannot be cancel.',
      });
    }

    const currentUser = req.userId;

    if (currentUser !== meetup.user_id) {
      return res
        .status(400)
        .json({ error: 'Only the owner can cancel this Meetup.' });
    }

    await Meetup.destroy({
      where: { id },
    });
    return res.status(200).json({ ok: true });
  }
}

export default new MeetupController();
