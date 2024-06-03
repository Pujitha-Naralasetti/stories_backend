module.exports = (app) => {
  const Story = require("../controllers/stories.controller.js");
  const { authenticateRoute } = require("../authentication/authentication");
  var router = require("express").Router();

  // Create story
  router.post("/stories", [authenticateRoute], Story.create)

  // Retrieve a all the story properties
  router.get("/storyProperties", [authenticateRoute], Story.getStoryProperties);

  app.use("/storiesapi", router);
};
