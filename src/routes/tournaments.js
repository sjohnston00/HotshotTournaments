const express = require("express");
const router = express.Router();
const Tournament = require("../models/Tournament");
const Message = require("../models/Message");
const Team = require("../models/Team");
const { verifyToken } = require("../middlewares/verifyToken");
const { ensureAuthenticated } = require("../config/auth");
const crypto = require("crypto");

//GET ALL TOURNAMENTS
router.get("/", ensureAuthenticated, async (req, res) => {
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
    req.flash("error_msg", "Something went wrong, Please try again later");
    res.status(500).redirect("/");
  }
});

//GET ALL THE USERS TOURNAMENTS
router.get("/myTournaments", ensureAuthenticated, async (req, res) => {
  try {
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
    req.flash("error_msg", "Something went wrong, Please try again later");
    res.status(500).redirect("/");
  }
});

//Add user to tournament
router.get(
  "/:tournamentID/invite/:token",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const { tournamentID, token } = req.params;
      const tournament = await Tournament.findOne({
        _id: tournamentID,
        inviteCode: token
      });

      if (!tournament) {
        req.flash("error_msg", "Tournament Not Found");
        return res.redirect(`/tournaments/myTournaments`);
      }
      if (tournament.users.includes(req.user._id)) {
        req.flash("error_msg", "You are already part of this tournament");
        return res.redirect(`/tournaments/${tournamentID}`);
      }
      const today = new Date();
      if (tournament.endDate < today) {
        req.flash("error_msg", "Tournament has already ended");
        return res.redirect(`/tournaments/myTournaments`);
      }
      //ADD THE USER ID TO THE TOURNAMENT
      tournament.users.push(req.user._id);
      const savedTournament = await tournament.save();
      req.flash("success_msg", "You are now part of this tournament");
      return res.redirect(`/tournaments/${tournamentID}`);
    } catch (error) {
      req.flash("error_msg", error.message);
      return res.redirect(`/tournaments/myTournaments`);
    }
  }
);

router.get("/createTournament", ensureAuthenticated, (req, res) => {
  const todayDate = new Date();
  todayDate.setSeconds(0, 0);
  res.render("tournaments/createTournament", {
    startDate: todayDate.toISOString().replace("Z", ""),
    endDate: new Date().toISOString()
  });
});

//CREATE A NEW TOURNAMENT
router.post("/createTournament", ensureAuthenticated, async (req, res) => {
  // return res.send(req.body);
  const { name, description, game, type, startDate, endDate, size } = req.body;
  if (
    !name ||
    !description ||
    !game ||
    !type ||
    !startDate ||
    !endDate ||
    !size
  ) {
    req.flash(
      "error_msg",
      "Name, Description, Game, Type, Size, Start Date and End Date are required"
    );
    return res.redirect("/tournaments/createTournament");
  }
  const nowDate = new Date();
  if (new Date(startDate) < nowDate) {
    req.flash("error_msg", "Start date cannot be before today");
    return res.redirect("/tournaments/createTournament");
  } else if (new Date(endDate) < nowDate) {
    req.flash("error_msg", "Ending Date cannot be before today");
    return res.redirect("/tournaments/createTournament");
  } else if (new Date(endDate) < new Date(startDate)) {
    req.flash("error_msg", "Ending Date cannot be before Starting Date");
    return res.redirect("/tournaments/createTournament");
  }

  //CREATE AN INVITE CODE AND SET THE EXPIRATION DATE TO END DATE
  const buffer = crypto.randomBytes(6);
  const token = buffer.toString("hex");

  //CREATE THE TOURNAMENT BRACKET FROM THE limitconst emptyTournamentLimit = 16;
  const bracket = {
    teams: []
  };
  for (let index = 0; index < Number(size) / 2; index++) {
    bracket.teams.push(Array(2).fill(null));
  }

  let newTournament;

  //VALIDATE TOURNAMENT TYPE
  if (type === "single") {
    newTournament = new Tournament({
      name: name,
      description: description,
      game: game,
      type: type,
      bracket: bracket,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      messages: [],
      users: [req.user._id],
      creator: req.user._id,
      inviteCode: token,
      inviteCodeExpiryDate: new Date(endDate),
      limit: Number(size)
    });
  } else if (type === "team") {
    newTournament = new Tournament({
      name: name,
      description: description,
      game: game,
      type: type,
      bracket: bracket,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      messages: [],
      creator: req.user._id,
      teams: [],
      inviteCode: token,
      inviteCodeExpiryDate: new Date(endDate),
      limit: Number(size)
    });
  } else {
    req.flash("error_msg", "Invalid Tournament Type");
    return res.redirect("/tournaments/createTournament");
  }

  try {
    const savedTournament = await newTournament.save();
    req.flash("success_msg", "New Tournament Created");
    return res.redirect(`/tournaments/${savedTournament._id}`);
  } catch (error) {
    req.flash("error_msg", error.message);
    return res.redirect("/tournaments/createTournament");
  }
});

//GET 1 TOURNAMENT
router.get("/:tournamentID", ensureAuthenticated, async (req, res) => {
  //VALIDATE THAT THE USERS ID IS VALID FOR THIS TOURNAMENT
  try {
    const tournamentID = req.params.tournamentID;
    const tournament = await Tournament.findOne({
      _id: tournamentID
    })
      .populate("users")
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
      req.flash("error_msg", "Tournament Not Found");
      return res.status(404).redirect("/tournaments/myTournaments");
    }

    let found = false;
    for (let i = 0; i < tournament.users.length; i++) {
      //https://stackoverflow.com/questions/15724272/what-is-the-difference-between-id-and-id-in-mongoose
      if (tournament.users[i].id === req.user.id) {
        found = true;
        break;
      }
    }

    if (!found) {
      req.flash("error_msg", "You are not part of this tournament");
      return res.status(401).redirect("/tournaments/myTournaments");
    }

    //Reason why its .id and not _id is because .id is the getter method for the _id as its still treated as a ObjectId
    //https://stackoverflow.com/questions/15724272/what-is-the-difference-between-id-and-id-in-mongoose
    //https://stackoverflow.com/questions/11637353/comparing-mongoose-id-and-strings
    const isTournamentCreator = tournament.creator.equals(req.user._id)
      ? true
      : false;

    //GET THE FULL URL SO IT CAN BE USED IN THE TEXTBOX
    const fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;

    res.render("tournaments/viewTournament", {
      tournament: tournament,
      tournamentInviteLink: `${fullUrl}/invite/${tournament.inviteCode}`,
      isTournamentCreator: isTournamentCreator,
      bracketString: JSON.stringify(tournament.bracket, null, 2)
    });
  } catch (error) {
    req.flash("error_msg", error.message);
    return res.status(500).redirect("/tournaments/myTournaments");
  }
});

//UPDATE A TOURNAMENT
router.put("/:tournamentID", ensureAuthenticated, async (req, res) => {
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
router.get(
  "/deleteTournament/:tournamentID",
  ensureAuthenticated,
  async (req, res) => {
    const { tournamentID } = req.params;
    try {
      const deletedTournament = await Tournament.deleteOne({
        _id: tournamentID,
        users: req.user._id
      });
      if (deletedTournament.deletedCount === 0) {
        req.flash("error_msg", "Something went wrong, please try again later");
        return res.redirect("/tournaments/myTournaments");
      }

      //TODO: DELETE THE MESSAGES ASSOCIATED WITH THAT TOURNAMENT
      const tournamentsMessages = await Message.deleteMany({
        tournament: tournamentID
      });
      req.flash("success_msg", "Your tournament has been deleted"); //give user a log out success message
      res.redirect("/tournaments/myTournaments");
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

//DEV ZONE
//TODO: Delete these routes in production
router.get("/deleteTournaments/all", async (req, res) => {
  try {
    const deletedTournaments = await Tournament.deleteMany();
    const deletedMessages = await Message.deleteMany();
    const deletedTeams = await Team.deleteMany();
    req.flash("success_msg", "Everything Deleted");
    res.redirect("/tournaments/myTournaments");
  } catch (error) {
    req.flash("error_msg", error.message);
    res.redirect("/tournaments/myTournaments");
  }
});

module.exports = router;
