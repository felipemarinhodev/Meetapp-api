import Sequelize, { Model } from 'sequelize';

class Subscribe extends Model {
  static init(sequelize) {
    super.init(
      {
        subscribe_in: Sequelize.DATE,
      },
      { sequelize }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    this.belongsTo(models.Meetup, { foreignKey: 'meetup_id', as: 'meetup' });
  }
}

export default Subscribe;
