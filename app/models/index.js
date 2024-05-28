const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.storyCharacter = require("./storyCharacter.model.js")(sequelize, Sequelize);
db.character = require("./character.model.js")(sequelize, Sequelize);
db.language = require("./language.model.js")(sequelize, Sequelize);
db.setting = require("./setting.model.js")(sequelize, Sequelize);
db.genre = require("./genre.model.js")(sequelize, Sequelize);
db.story = require("./story.model.js")(sequelize, Sequelize);
db.session = require("./session.model.js")(sequelize, Sequelize);
db.user = require("./user.model.js")(sequelize, Sequelize);

// foreign key for session
db.user.hasMany(db.session, { onDelete: "CASCADE" });
db.session.belongsTo(db.user, { onDelete: "CASCADE" });

// foreign key for STORY
db.user.hasMany(db.story, { foreignKey: "userId" });
db.story.belongsTo(db.user, { foreignKey: "userId", as: "user" });

db.genre.hasMany(db.story, { foreignKey: "genreId" });
db.story.belongsTo(db.genre, { foreignKey: "genreId", as: "genre" });

db.setting.hasMany(db.story, { foreignKey: "settingId" });
db.story.belongsTo(db.setting, { foreignKey: "settingId", as: "setting" });

db.language.hasMany(db.story, { foreignKey: "languageId" });
db.story.belongsTo(db.language, { foreignKey: "languageId", as: "language" });

db.story.belongsToMany(db.character, { through: db.storyCharacter });
db.character.belongsToMany(db.story, { through: db.storyCharacter });

module.exports = db;
