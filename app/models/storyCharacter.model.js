module.exports = (sequelize, Sequelize) => {
  const StoryCharacter = sequelize.define(
    "storyCharacter",
    {},
    {
      timestamps: false,
    }
  );
  return StoryCharacter;
};
