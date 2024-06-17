const { jsPDF } = require("jspdf");
const db = require("../models");
const { Op } = require("sequelize");
const Genre = db.genre;
const Setting = db.setting;
const Language = db.language;
const Story = db.story;
const Character = db.character;
const StoryCharacter = db.storyCharacter;
const doc = new jsPDF();
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
        storyLength: parseInt(storyLength),
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

exports.findAll = async (req, res) => {
  await Story.findAll().then((data) => {
    res.send({
      message: "Stories fetched successfully",
      data: data,
      status: "Success",
    });
  });
};

exports.findAllByUserId = async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    await Story.findAll({
      where: { userId: userId, isDeleted: false },
      attributes: { exclude: ["genreId", "settingId", "languageId"] },
      include: [
        { model: Genre, as: "genre", required: true },
        { model: Setting, as: "setting", required: true },
        { model: Language, as: "language", required: true },
        {
          model: Character,
          as: "characters",
          required: true,
        },
      ],
    }).then((data) => {
      res.send({
        message: "Stories fetched successfully",
        data: data,
        status: "Success",
      });
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error fetching story",
      status: "Error",
    });
  }
};

exports.findOne = async (req, res) => {
  const storyId = parseInt(req.params.id);
  try {
    await Story.findOne({
      where: { id: storyId, isDeleted: false },
      attributes: { exclude: ["genreId", "settingId", "languageId"] },
      include: [
        { model: Genre, as: "genre", required: true },
        { model: Setting, as: "setting", required: true },
        { model: Language, as: "language", required: true },
        {
          model: Character,
          as: "characters",
          required: true,
        },
      ],
    }).then((data) => {
      if (!data) {
        res.send({
          message: "Story not found",
          status: "Error",
        });
      } else {
        res.send({
          message: "Story fetched successfully",
          data: data,
          status: "Success",
        });
      }
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error fetching story",
      status: "Error",
    });
  }
};

exports.update = async (req, res) => {
  const storyId = req.params.id; 
  const updatedStoryData = req.body;
  

  try {
    const story = await Story.findByPk(storyId);

    if (!story) {
      return res.send({
        message: "Story not found",
        status: "Error",
      });
    }

    await story.update(updatedStoryData);

    res.send({
      message: "Story updated successfully",
      status: "Success",
    });
  } catch (error) {
    console.error('Error updating story:', error);
    res.status(500).json({ message: 'Error updating story' });
  }

  
}

exports.delete = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const story = await Story.findByPk(id);
    if (!story) {
      res.send({
        message: `Story with ID ${id} not found`,
        status: "Error",
      });
    } else {
      await story.update({ isDeleted: true });
      res.send({
        message: "Story deleted successfully",
        status: "Success",
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error deleting story",
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

exports.generatePDF = async (req, res) => {
  const storyId = req.params.id;
  const story = await Story.findByPk(storyId);
  if (!story) {
    return res.send({
      message: `Story with ID ${id} not found`,
      status: "Error",
    });
  }

  const titleFontSize = 20;
  const titleFontFamily = "timesnewroman";
  const contentFontSize = 12;
  const contentFontFamily = "helvetica";
  const contentColor = [0, 0, 0];

  // Define margins and page width
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Calculate title width
  const titleWidth = doc.getTextWidth(story.title);

  // Calculate horizontal offset for centering
  const titleOffsetX = (pageWidth - titleWidth) / 2;

  // Set font and color for title
  doc.setFont(titleFontFamily, titleFontSize);
  doc.setTextColor(...contentColor); // Use defined color

  // Write title centered at y-position 10 (adjust as needed)
  doc.text(titleOffsetX, 10, story.title);

  // Define line spacing and initial y-position for content
  const lineHeight = 5; // Adjust line spacing for readability
  let contentY = margin + titleFontSize + lineHeight; // Start below title

  // Function to split and write content with overflow handling
  function writeOverflowContent(text, maxWidth, y) {
    const lines = doc.splitTextToSize(text, maxWidth);
    for (let line of lines) {
      doc.text(margin, y, line); // Write each line with margin
      y += lineHeight; // Move down for next line
      if (y + lineHeight > doc.internal.pageSize.getHeight() - margin) {
        // Reached page bottom, add overflow message
        doc.text(margin, y, "... (Content continues on next page)");
        doc.addPage()
        y = 45
        doc.text(margin, y, line);
      }
    }
  }

  // Write story content with overflow handling
  writeOverflowContent(story.content, pageWidth - margin * 2, contentY);

  const pdfDataUri = doc.output("datauristring");
  const base64Data = pdfDataUri.split(",")[1]; // Extract base64 data
  const buffer = Buffer.from(base64Data, "base64");
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=story.pdf");
  res.send(buffer); // Send PDF buffer to frontend
};
exports.generateSequel = async (req, res) => {
  const id = req.params.id;

  try {
    const story = await Story.findByPk(id);

    if (!story) {
      res.send({
        message: "Story not found",
        status: "Error",
      });
    } else {
      // const prompt = `Write a sequel to the following story:\n${story.content}`;
      const prompt = `Previously\n${story.content}\n\n The Sequel\nWrite a continuation of the story above.`;
      const chat = await cohere.chat({
        model: "c4ai-aya-23",
        message: prompt,
        task: "storytelling",
        temperature: 0.8,
      });

      const filteredStory = chat?.text
        .replace(/^.*\n\n/g, "")
        .replace(/Title:.*\n/g, "")
        .replace(/##.*\n/g, "")
        .trim();
        let updatedStory = ''
      if(story.episodes === 1) {
        updatedStory = `CHAPTER 1\n\n${story.content}\n\nCHAPTER ${++story.episodes}\n\n${filteredStory}`
      }else {
        updatedStory = `${story.content}\n\nCHAPTER ${++story.episodes}\n\n${filteredStory}`
      }

      await story.update({content: updatedStory, episodes: ++story.episodes})

      res.status(200).send({
        message: "Story sequel generated successfully",
        status: "Success",
        data: null,
      });
    }
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error creating story",
      status: "Error",
    });
  }
};

