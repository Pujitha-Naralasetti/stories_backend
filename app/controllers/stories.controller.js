const db = require("../models");
const Genre = db.genre;
const Setting = db.setting;
const Language = db.language;
const { CohereClient } = require("cohere-ai");

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

exports.create = async (req, res) => {
  const payload = req.body;
  const { title, genre, storyLength, characters, storyTheme, storyLaguage } =
    payload;

  let prompt = `Write a ${genre} story titled "${title}" set in the ${storyTheme} featuring characters like `;
  characters.forEach((character) => {
    prompt += `${character.name} the ${character.role}, `;
  });

  prompt = prompt.slice(0, -2);

  prompt += `. The story should be around ${storyLength} words long.`;

  if (storyLaguage) {
    prompt += ` (In ${storyLaguage})`;
  }
  try {
    const chat = await cohere.chat({
      model: "c4ai-aya-23",
      message: prompt,
      task: "storytelling",
      temperature: 0.8,
    });
    if (chat?.text) {
      const filteredStory = chat?.text
        .replace(/^.*\n\n/g, "")
        .replace(/Title:.*\n/g, "")
        .trim();

      const genreId = await Genre.findOne({
        where: { genreName: payload.genreName },
        attributes: ["genreId"],
      });
      const settingId = await Setting.findOne({
        where: { settingName: payload.settingName },
        attributes: ["settingId"],
      });
      const languageId = await Language.findOne({
        where: { languageName: payload.languageName },
        attributes: ["languageId"],
      });
      console.log(genreId, settingId, languageId);
      const storyData = {
        userId: payload.userId,
        title: payload.title,
        genreId: genreId?.genreId,
        settingId: settingId?.settingId,
        languageId: languageId?.languageId,
        storyLength: 100,
        content: chat?.text,
      };

      await Story.create(storyData).then(async (data) => {
        let storyId = data?.id;
        if (payload?.characters?.length > 0) {
          const characters = [];
          for (const char of payload?.characters) {
            const [existingCharacter] = await Character.findOrCreate({
              where: {
                [Op.and]: [
                  // Use AND operator to check both name and role
                  { name: char.name },
                  { role: char.role },
                ],
              }, // Check for existing character with same name
              defaults: char, // Defaults for creating a new character
            });
            characters.push(existingCharacter); // Add existing or newly created character
          }
          await StoryCharacter.bulkCreate(
            characters.map((character) => ({
              storyId: storyId,
              characterId: character.id,
            }))
          );
        }
      });
    }

    res.status(200).send({
      message: "Story generated successfully",
      status: "Success",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error creating story",
      status: "Error",
    });
  }
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
