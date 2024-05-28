module.exports = (sequelize, Sequelize) => {
  const Language = sequelize.define(
    "language",
    {
      languageId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      languageName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );
  return Language;
};
