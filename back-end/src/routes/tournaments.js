const express = require("express");
const router = express.Router();
const Tournament = require("../models/Tournament");
const { verifyToken } = require("../middlewares/verifyToken");

//GET ALL TOURNAMENTS
router.get("/", verifyToken, async (req, res) => {
  try {
    const tournaments = await Tournament.find().populate("users");
    res.send(tournaments);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

//GET ALL USERS TOURNAMENTS
router.get("/myTournaments", verifyToken, async (req, res) => {
  try {
    const tournaments = await Tournament.find();
    res.status(200).send(tournaments);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

//GET 1 TOURNAMENT
router.get("/:tournamentID", verifyToken, async (req, res) => {
  //VALIDATE THAT THE USERS ID IS VALID FOR THIS TOURNAMENT

  try {
    const tournamentID = req.params.tournamentID;
    const tournament = await Tournament.find({ _id: tournamentID });

    res.status(200).send(tournament);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

//Add user to tournament
router.get("/addToTournament/:tournamentID", verifyToken, async (req, res) => {
  try {
    const { tournamentID } = req.params;
    const tournament = await Tournament.findOne({ _id: tournamentID });
    if (!tournament) {
      res.status(404).send("Invalid Tournament ID");
    }

    //ADD THE USER ID TO THE TOURNAMENT
    tournament.users.push(req.user._id);
    const savedTournament = await tournament.save();
    res.status(200).send(savedTournament);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

router.post("/", verifyToken, async (req, res) => {
  //USE A MIDDLEWARE TO VALIDATE THE ACCESS TOKEN
  //VALIDATE THE DATA
  const newTournament = new Tournament({
    name: req.body.name,
    description: req.body.description,
    game: req.body.game,
    type: req.body.type,
    startDate: new Date(req.body.startDate),
    endDate: new Date(req.body.endDate),
    users: [req.user._id]
    // discussionBoardID: req.body.discussionBoardID,
  });

  try {
    const savedTournament = await newTournament.save();
    res.send(savedTournament);
  } catch (error) {
    res.json({ message: error });
  }
});

//UPDATE A TOURNAMENT
router.put("/:tournamentID", verifyToken, async (req, res) => {
  try {
    const updatedTournament = await Tournament.updateOne(
      { _id: req.params.tournamentID },
      {
        $set: {
          name: req.body.name,
          description: req.body.description,
          game: req.body.game,
          type: req.body.type,
          startDate: new Date(req.body.startDate),
          endDate: new Date(req.body.endDate),
          // discussionBoardID: req.body.discussionBoardID,
          users: req.body.users
        }
      }
    );
    res.status(200).send(updatedTournament);
  } catch (error) {
    res.json({ message: error });
  }
});

//DELETE A TOURNAMENT
//THIS SHOULDN'T BE DONE AS WE STILL WANT USERS TO BE ABLE TO SEE PAST TOURNAMENTS
//BUT ITS NICE TO HAVE THE METHOD THERE
router.delete("/:tournamentID", verifyToken, async (req, res) => {
  try {
    const tournamentID = req.params.tournamentID;
    const deletedTournament = await Tournament.deleteOne({ _id: tournamentID });

    res.status(200).send({
      message: "tournament deleted",
      deletedTournament: deletedTournament
    });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

module.exports = router;
