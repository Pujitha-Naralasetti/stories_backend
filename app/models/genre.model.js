module.exports = (sequelize, Sequelize) => {
  const Genre = sequelize.define(
    "genre",
    {
      genreId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      genreName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );

  return Genre;
};
