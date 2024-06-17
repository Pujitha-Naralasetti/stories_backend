module.exports = (app) => {
  const Story = require("../controllers/stories.controller.js");
  const { authenticateRoute } = require("../authentication/authentication");
  var router = require("express").Router();
  // Create story
  router.post("/stories", [authenticateRoute], Story.create)

  // findAllStories

  router.get("/stories/",[authenticateRoute], Story.findAll)

  // findAllStoriesByUserId

  router.get("/stories/User/:id",[authenticateRoute], Story.findAllByUserId)

  // find story by id

  router.get("/stories/:id",[authenticateRoute], Story.findOne)

  // update story  

  router.put("/stories/:id", [authenticateRoute], Story.update)


  // Delete a storiy with id
  router.delete("/stories/:id", [authenticateRoute], Story.delete);

  // Retrieve a all the story properties
  router.get("/storyProperties", [authenticateRoute], Story.getStoryProperties);
  
   // Generate PDF
   router.get('/stories/generatePDF/:id', Story.generatePDF)

    // Generate Sequel
  router.get('/stories/generateSequel/:id', [authenticateRoute], Story.generateSequel)

  app.use("/storiesapi", router);
};
