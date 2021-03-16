const moment = require('moment');
const crypto = require("crypto");
const Tournament = require("../models/Tournament");

exports.get_all_users_tournaments = async (req, res) => {
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
};

exports.add_user_to_tournament = async (req, res) => {
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

exports.get_create_tournament = (req, res) => {
    const startDate = moment().utc().local().format(moment.HTML5_FMT.DATETIME_LOCAL);
    const endDate = moment().add(1, "week").utc().local().format(moment.HTML5_FMT.DATETIME_LOCAL);
    res.render("tournaments/createTournament", {
      startDate: startDate,
      endDate: endDate
    });
};
// TODO: Review this function to see if it can be slimmed down
exports.post_create_tournament = async (req, res) => {
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
}

exports.generate_tournament_bracket = async (req, res) => {
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