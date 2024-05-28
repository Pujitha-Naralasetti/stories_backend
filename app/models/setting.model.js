module.exports = (sequelize, Sequelize) => {
  const Setting = sequelize.define(
    "setting",
    {
      settingId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      settingName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );

  return Setting;
};
