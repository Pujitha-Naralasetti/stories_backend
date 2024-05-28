module.exports = (app) => {
    const Story = require("../controllers/stories.controller.js");
    const { authenticateRoute } = require("../authentication/authentication");
    var router = require("express").Router();
  
    // Retrieve a single User with id
    router.get("/storyProperties", [authenticateRoute], Story.getStoryProperties);
  
    app.use("/storiesapi", router);
  };
  