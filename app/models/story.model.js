module.exports = (sequelize, Sequelize) => {
  const Story = sequelize.define("story", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    genreId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    settingId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    storyLength: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    languageId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  });

  return Story;
};
