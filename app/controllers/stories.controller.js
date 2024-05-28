const db = require("../models");
const Genre = db.genre;
const Setting = db.setting;
const Language = db.language;

exports.getStoryProperties = async (req, res) => {
  try {
    const genres = await Genre.findAll();
    const languages = await Language.findAll();
    const settings = await Setting.findAll();
    res.send({
      message: "Story properties fetched successfully",
      data: { genres, languages, settings },
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error fetching story properties",
    });
  }
};
