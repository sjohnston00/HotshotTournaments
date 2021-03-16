const moment = require('moment');
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