const express = require("express");
const router = express.Router();
const Tournament = require("../models/Tournament");
const Message = require("../models/Message");
const Team = require("../models/Team");
const { ensureAuthenticated } = require("../config/auth");
const crypto = require("crypto");
const moment = require('moment');

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
    //THE FIRST PARAMETER OF THIS FUNCTION IS TO SET THE ERROR MESSAGE IN THE CONSOLE TO A RED COLOUR
    //TODO: FOR THE SAKE OF NOT REPEATING CODE, TURN INTO A FUNCTION
    //E.G handleError('/tournaments/myTournaments', error)
    //First params is where to redirect to and second is the error object from the catch
    console.error("\x1b[31m", `Error: ${error.message}`);
    req.flash("error_msg", "Something went wrong, Please try again later");
    return res.redirect("/");
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

      if (tournament.users.length >= tournament.limit) {
        req.flash("error_msg", "Tournament is at full capacity");
        return res.redirect(`/tournaments/myTournaments`);
      }
      const today = new Date();
      if (tournament.endDate < today) {
        req.flash("error_msg", "Tournament has already ended");
        return res.redirect(`/tournaments/myTournaments`);
      }
      //ADD THE USER ID TO THE TOURNAMENT
      tournament.users.push(req.user._id);
      await tournament.save();
      req.flash("success_msg", "You are now part of this tournament");
      return res.redirect(`/tournaments/${tournamentID}`);
    } catch (error) {
      console.error("\x1b[31m", `Error: ${error.message}`);
      req.flash("error_msg", "Something went wrong, Please try again later");
      return res.redirect("/tournaments/myTournaments");
    }
  }
);

router.get("/createTournament", ensureAuthenticated, (req, res) => {
  const startDate = moment().utc().local().format(moment.HTML5_FMT.DATETIME_LOCAL);
  const endDate = moment().add(1, "week").utc().local().format(moment.HTML5_FMT.DATETIME_LOCAL);
  res.render("tournaments/createTournament", {
    startDate: startDate,
    endDate: endDate
  });
});

//CREATE A NEW TOURNAMENT
router.post("/createTournament", ensureAuthenticated, async (req, res) => {
  const { name, description, game, type, startDate, endDate, size } = req.body;
  //TODO: VALIDATE BODY PARAMS IN SEPERATE FILE
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

  //CREATE THE TOURNAMENT BRACKET FROM THE TOURNAMENT limit ;
  const bracket = {
    teams: []
  };
  for (let index = 0; index < Number(size) / 2; index++) {
    bracket.teams.push(Array(2).fill(null));
  }

  let newTournament;

  //VALIDATE TOURNAMENT TYPE
  //TODO: Change to SWTICH statement as it makes the code more versatile for the future
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
    console.error("\x1b[31m", `Error: ${error.message}`);
    req.flash("error_msg", "Something went wrong, Please try again later");
    return res.redirect("/tournaments/createTournament");
  }
});

router.get(
  "/generateTournamentBracket/:tournamentID",
  ensureAuthenticated,
  async (req, res) => {
    const { tournamentID } = req.params;
    const tournament = await Tournament.findOne({
      _id: tournamentID
    }).populate("users");

    if (!tournament) {
      req.flash("error_msg", "Tournament Not Found");
      return res.status(404).redirect("/tournaments/myTournaments");
    }

    const isTournamentCreator = tournament.creator.equals(req.user._id)
      ? true
      : false;

    if (!isTournamentCreator) {
      req.flash("error_msg", "You are not part of this tournament");
      return res.status(401).redirect("/tournaments/myTournaments");
    }

    //MAKE A COPY OF THE TOURNAMENT USERS ARRAY
    let tournamentUsers = tournament.users;

    for (let index = 0; index < tournament.bracket.teams.length; index++) {
      const currentArray = tournament.bracket.teams[index];
      const faceOff = addRandomUsers(currentArray);

      tournament.bracket.teams[index] = faceOff;
    }
    function addRandomUsers(array) {
      for (let index = 0; index < array.length; index++) {
        const randomUser =
          tournamentUsers[Math.floor(Math.random() * tournamentUsers.length)];
        if (randomUser == undefined) {
          return array;
        } else {
          array[index] = randomUser.name;
          tournamentUsers = tournamentUsers.filter(
            (item) => item.name !== randomUser.name
          );
        }
      }
      return array;
    }

    try {
      tournament.markModified("bracket"); //this tells mongoose thats the bracket has been modified so make sure to save it this way
      const savedTournament = await tournament.save();
      req.flash("success_msg", "Tournament bracket has been generated");
      return res.redirect(`/tournaments/${savedTournament._id}`);
    } catch (error) {
      console.error("\x1b[31m", `Error: ${error.message}`);
      req.flash("error_msg", "Something went wrong, Please try again later");
      res.redirect("/tournaments/myTournaments");
    }
  }
);

//GET 1 TOURNAMENT
router.get("/:tournamentID", ensureAuthenticated, async (req, res) => {
  try {
    const { tournamentID } = req.params;
    const tournament = await Tournament.findOne({
      _id: tournamentID
    })
      .populate("users", "-__v -password")
      .populate({
        path: "messages",
        select: "-_id -__v -tournament",
        populate: {
          path: "user",
          model: "users",
          select: "-_id -__v -password"
        }
      });
    //TODO: VALIDATION SHOULD BE IN ANOTHER FILE
    if (!tournament) {
      req.flash("error_msg", "Tournament Not Found");
      return res.status(404).redirect("/tournaments/myTournaments");
    }

    //FIND THE USERS ID IN THE TOURNAMENT
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

    //Reason why its .id and not _id is because .id is the getter method for the _id as its still treated as a mongo ObjectId
    //https://stackoverflow.com/questions/15724272/what-is-the-difference-between-id-and-id-in-mongoose
    //https://stackoverflow.com/questions/11637353/comparing-mongoose-id-and-strings
    const isTournamentCreator = tournament.creator.equals(req.user._id)
      ? true
      : false;

    //GET THE FULL URL SO IT CAN BE USED IN THE TEXTBOX
    //TODO: FIGURE OUT WHY THIS RENDERS THE URL WITH HTTP NOT HTTPS
    const fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
    res.render("tournaments/viewTournament", {
      tournament: tournament,
      tournamentInviteLink: `${fullUrl}/invite/${tournament.inviteCode}`,
      isTournamentCreator: isTournamentCreator,
      bracketString: JSON.stringify(tournament.bracket)
      /*REASON: Mustache will not allow front-end script to access the properties that are passed from the server
        therefore I'm having to turn the JSON object to a string, then put the string in a <textarea/> element and hide import PropTypes from 'prop-types'
        THIS IS WHY I HATE MUSTACHE
      */
    });
  } catch (error) {
    req.flash("error_msg", error.message);
    return res.status(500).redirect("/tournaments/myTournaments");
  }
});

router.post(
  "/saveTournamentBracket/:tournamentID",
  ensureAuthenticated,
  async (req, res) => {
    const { bracket } = req.body;
    const { tournamentID } = req.params;

    try {
      const tournament = await Tournament.findById(tournamentID);
      if (!tournament) {
        req.flash("error_msg", "Tournament Not Found");
        return res.redirect("/tournaments/myTournaments");
      }
      tournament.bracket = JSON.parse(bracket);
      tournament.markModified("bracket");
      const updatedTournament = await tournament.save();
      req.flash("success_msg", "Tournament bracket saved");
      return res.redirect(`/tournaments/${updatedTournament._id}`);
    } catch (error) {
      console.error("\x1b[31m", `Error: ${error.message}`);
      req.flash("error_msg", "Something went wrong, Please try again later");
      return res.redirect("/tournaments/myTournaments");
    }
  }
);

//UPDATE A TOURNAMENT
router.put("/:tournamentID", ensureAuthenticated, async (req, res) => {
  //TODO: VALIDATION SHOULD BE IN SEPERATE FILE
  const { tournamentID } = req.params;
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
    req.flash(
      "error_msg",
      "Name, Description, Game, Tournament Type, Start Date, End Date, Messages and Users are required fields"
    );
    return res.redirect(`/tournaments/${tournamentID}`);
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
      { _id: tournamentID },
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
    req.flash("success_msg", "Tournament has been updated");
    return res.redirect(`/tournaments/${updatedTournament._id}`);
  } catch (error) {
    console.error(error.message);
    req.flash("error_msg", "Something went wrong please try again later");
    return res.redirect(`/tournaments/${updatedTournament._id}`);
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
      //TODO: VALIDATE THAT THIS USER IS THE TOURNAMENT CREATOR
      //TODO: VALIDATE ON DIFFERENT FILE
      const deletedTournament = await Tournament.deleteOne({
        _id: tournamentID,
        users: req.user._id
      });
      if (deletedTournament.deletedCount === 0) {
        req.flash("error_msg", "Something went wrong, please try again later");
        return res.redirect("/tournaments/myTournaments");
      }

      //delete all the messages associated with that tournament
      await Message.deleteMany({
        tournament: tournamentID
      });
      req.flash("success_msg", "Your tournament has been deleted");
      return res.redirect("/tournaments/myTournaments");
    } catch (error) {
      console.error(error.message);
      req.flash("error_msg", "Something went wrong please try again later");
      return res.redirect(`/tournaments/myTournaments`);
    }
  }
);

module.exports = router;
