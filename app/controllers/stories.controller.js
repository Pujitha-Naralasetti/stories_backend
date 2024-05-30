const db = require("../models");
const Genre = db.genre;
const Setting = db.setting;
const Language = db.language;
const { CohereClient } = require("cohere-ai");

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

exports.create = async (req, res) => {
  const { prompt } = req.body;
  const chat = await cohere.chat({
    model: "c4ai-aya-23",
    message: prompt,
    task: "storytelling",
    temperature: 0.8,
  });
  res.status(200).send({
    message: "Story generated successfully",
    data: chat,
    status: "Success",
  });
};

exports.getStoryProperties = async (req, res) => {
  try {
    const genres = await Genre.findAll();
    const languages = await Language.findAll();
    const settings = await Setting.findAll();
    res.send({
      message: "Story properties fetched successfully",
      data: { genres, languages, settings },
      status: "Success",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error fetching story properties",
      status: "Error",
    });
  }
};
