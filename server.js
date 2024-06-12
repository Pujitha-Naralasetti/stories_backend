require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const db = require("./app/models");


db.sequelize
  .sync({
    force: false,
  })
  .then(() => {

    db.language.findAll().then((data) => {
      if (data?.length === 0) {
        db.language
          .bulkCreate([
            {
              languageId: 1,
              languageName: "English",
            },
            {
              languageId: 2,
              languageName: "Hindi",
            },
            {
              languageId: 3,
              languageName: "Telugu",
            },
          ])
          .then(() => {
            console.log("Records are inserted into table Language");
          })
          .catch((e) => {
            console.log("Trouble inserting records into Language table", e);
          });
      }
    });

    db.genre.findAll().then((data) => {
      if (data?.length === 0) {
        db.genre
          .bulkCreate([
            {
              genreId: 1,
              genreName: "Crime",
            },
            {
              genreId: 2,
              genreName: "Romance",
            },
            {
              genreId: 3,
              genreName: "Horror",
            },
            {
              genreId: 4,
              genreName: "Thriller",
            },
            {
              genreId: 5,
              genreName: "Sci-Fi",
            },
            {
              genreId: 6,
              genreName: "Comedy",
            },
          ])
          .then(() => {
            console.log("Records are inserted into table Genre");
          })
          .catch((e) => {
            console.log("Trouble inserting records into Genre table", e);
          });
      }
    });

    db.setting.findAll().then((data) => {
      if (data?.length === 0) {
        db.setting
          .bulkCreate([
            {
              settingId: 1,
              settingName: "Hills",
            },
            {
              settingId: 2,
              settingName: "Beach",
            },
            {
              settingId: 3,
              settingName: "Forest",
            },
            {
              settingId: 4,
              settingName: "City",
            },
            {
              settingId: 5,
              settingName: "TownSide",
            },
          ])
          .then(() => {
            console.log("Records are inserted into table Settings");
          })
          .catch((e) => {
            console.log("Trouble inserting records into Settings table", e);
          });
      }
    });

  })
  .catch((e) => {
    console.log("Error creating table", e);
  });

var corsOptions = {
  origin: "http://localhost:8081",
};

app.use(cors(corsOptions));
app.options("*", cors());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the stories backend." });
});

require("./app/routes/auth.routes.js")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/stories.routes.js")(app);

// set port, listen for requests
const PORT = process.env.PORT || 3201;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
}module.exports = app;
