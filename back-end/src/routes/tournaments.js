const express = require("express");
const router = express.Router();
const Tournament = require("../models/Tournament");

router.get("/", async (req, res) => {
  try {
    const tournaments = await Tournament.find();
    res.send(tournaments);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

//GET ALL USERS TOURNAMENTS
router.get("/:id", async (req, res) => {
  try {
    const tournaments = await Tournament.find();
    res.status(200).send(tournaments);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

//GET 1 TOURNAMENT
router.get("/:tournamentID", async (req, res) => {
  //VALIDATE THAT THE USERS ID IS VALID FOR THIS TOURNAMENT
});

//Add user to tournament
router.get("/:tournamentID", async (req, res) => {});

router.post("/", async (req, res) => {
  //USE A MIDDLEWARE TO VALIDATE THE ACCESS TOKEN
  //VALIDATE THE DATA
  const newTournament = new Tournament({
    name: req.body.name,
    description: req.body.description,
    game: req.body.game,
    type: req.body.type,
    startDate: new Date(req.body.startDate),
    endDate: new Date(req.body.endDate)
  });
  // discussionBoardID: req.body.discussionBoardID,
  // users: []

  try {
    const savedTournament = await newTournament.save();
    res.send(savedTournament);
  } catch (error) {
    res.json({ message: error });
  }
});

//UPDATE A TOURNAMENT
router.put("/:tournamentID", async (req, res) => {});

//DELETE A TOURNAMENT
//THIS SHOULDN'T BE DONE AS WE STILL WANT USERS TO BE ABLE TO SEE PAST TOURNAMENTS
//BUT ITS NICE TO HAVE THE METHOD THERE
router.delete("/:tournamentID", async (req, res) => {});

module.exports = router;
