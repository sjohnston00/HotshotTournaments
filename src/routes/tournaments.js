const express = require("express");
const router = express.Router();
const Tournament = require("../models/Tournament");
const Message = require("../models/Message");
const Team = require("../models/Team");
const { verifyToken } = require("../middlewares/verifyToken");

//GET ALL TOURNAMENTS
router.get("/", verifyToken, async (req, res) => {
  try {
    const tournaments = await Tournament.find()
      .select("-__v")
      .populate("users", "-_id -__v -password")
      .populate({
        path: "messages",
        populate: {
          path: "user",
          model: "users"
        }
      });
    res.send(tournaments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//GET ALL THE USERS TOURNAMENTS
router.get("/myTournaments", verifyToken, async (req, res) => {
  try {
    //TODO: test this when there are multiple users and tournaments in the database
    const tournaments = await Tournament.find({ users: req.user._id })
      .populate("users", "-_id -__v -password")
      .populate({
        path: "messages",
        select: "-_id -__v -tournament",
        populate: {
          path: "user",
          model: "users",
          select: "-_id -__v -password"
        }
      });
    res.render("tournaments/myTournaments", { tournaments: tournaments });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

//GET 1 TOURNAMENT
router.get("/:tournamentID", verifyToken, async (req, res) => {
  //VALIDATE THAT THE USERS ID IS VALID FOR THIS TOURNAMENT
  try {
    const tournamentID = req.params.tournamentID;
    const tournament = await Tournament.findOne({
      _id: tournamentID,
      users: req.user._id
    })
      .populate("users", "-_id -__v -password")
      .populate({
        path: "messages",
        select: "-_id -__v -tournament",
        populate: {
          path: "user",
          model: "users",
          select: "-_id -__v -password"
        }
      });
    if (!tournament) {
      return res.status(404).send("Invalid Tournament ID");
    }
    res.status(200).send(tournament);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

//Add user to tournament
router.post("/addToTournament/:tournamentID", verifyToken, async (req, res) => {
  try {
    const { tournamentID } = req.params;
    const tournament = await Tournament.findOne({ _id: tournamentID });

    if (!tournament) {
      res.status(404).send("Invalid Tournament ID");
    }
    if (tournament.users.includes(req.user._id)) {
      return res.status(401).send("User is already a part of this tournament");
    }
    //ADD THE USER ID TO THE TOURNAMENT
    tournament.users.push(req.user._id);
    const savedTournament = await tournament.save();
    res.status(200).send({
      message: "User has been added to tournament",
      tournament: savedTournament
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//CREATE A NEW TOURNAMENT
router.post("/", verifyToken, async (req, res) => {
  const { name, description, game, type, startDate, endDate } = req.body;

  if (!name || !description || !game || !type || !startDate || !endDate) {
    res
      .status(401)
      .send(
        "Name, Description, Game, Type, Start Date and End Date are required"
      );
  }
  const nowDate = new Date();
  if (new Date(startDate) < nowDate) {
    return res.status(401).send("Starting Date cannot be before today");
  } else if (new Date(endDate) < nowDate) {
    return res.status(401).send("Ending Date cannot be before today");
  } else if (new Date(endDate) < new Date(startDate)) {
    return res.status(401).send("Ending Date cannot be before Start date");
  }

  let newTournament;

  //VALIDATE TOURNAMENT TYPE
  if (type === "Single") {
    newTournament = new Tournament({
      name: name,
      description: description,
      game: game,
      type: type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      messages: [],
      users: [req.user._id]
    });
  } else if (type === "Team") {
    newTournament = new Tournament({
      name: name,
      description: description,
      game: game,
      type: type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      messages: [],
      teams: []
    });
  } else {
    res.status(401).send("Invalid Tournament Type");
  }
  //TODO: Debug this

  try {
    const savedTournament = await newTournament.save();
    res.send(savedTournament);
  } catch (error) {
    res.json({ message: error.message });
  }
});

//UPDATE A TOURNAMENT
router.put("/:tournamentID", verifyToken, async (req, res) => {
  const {
    name,
    description,
    game,
    type,
    startDate,
    endDate,
    messages,
    users
  } = req.body;

  if (
    !name ||
    !description ||
    !game ||
    !type ||
    !startDate ||
    !endDate ||
    !messages ||
    !users
  ) {
    return res
      .status(401)
      .send(
        "Name, Description, Game, Tournament Type, Start Date, End Date, Messages and Users are required fields"
      );
  }

  const nowDate = new Date();
  if (new Date(startDate) < nowDate) {
    return res.status(401).send("Starting Date cannot be before today");
  } else if (new Date(endDate) < nowDate) {
    return res.status(401).send("Ending Date cannot be before today");
  } else if (new Date(endDate) < new Date(startDate)) {
    return res.status(401).send("Ending Date cannot be before Start date");
  }

  try {
    const updatedTournament = await Tournament.updateOne(
      { _id: req.params.tournamentID },
      {
        $set: {
          name: name,
          description: description,
          game: game,
          type: type,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          messages: messages,
          users: users
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
//BUT IT'S NICE TO HAVE THE METHOD THERE
router.delete("/:tournamentID", verifyToken, async (req, res) => {
  const { tournamentID } = req.params;
  try {
    const deletedTournament = await Tournament.deleteOne({
      _id: tournamentID,
      users: req.user._id
    });
    if (deletedTournament.deletedCount === 0) {
      return res.status(401).send("This user is not part of this tournament");
    }

    //TODO: DELETE THE MESSAGES ASSOCIATED WITH THAT TOURNAMENT
    const tournamentsMessages = await Message.deleteMany({
      tournament: tournamentID
    });

    res.status(200).send({
      message: "tournament deleted",
      deletedTournament: deletedTournament,
      tournamentsMessages: tournamentsMessages
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//DEV ZONE
//TODO: Delete these routes in production
router.delete("/deleteTournaments/all", async (req, res) => {
  try {
    const deletedTournaments = await Tournament.deleteMany();
    const deletedMessages = await Message.deleteMany();
    const deletedTeams = await Team.deleteMany();
    res.send({
      message: "Everything deleted",
      deletedTournaments: deletedTournaments,
      deletedMessages: deletedMessages,
      deletedTeams: deletedTeams
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
