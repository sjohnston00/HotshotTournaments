const express = require("express");
const router = express.Router();
const Tournament = require("../models/Tournament");
const Message = require("../models/Message");
const { ensureAuthenticated } = require("../config/auth");
const controller = require("../controllers/tournamentsController");

router.get(
  "/myTournaments",
  ensureAuthenticated,
  controller.get_all_users_tournaments
);

router.get(
  "/:tournamentID/invite/:token",
  ensureAuthenticated,
  controller.add_user_to_tournament
);

router.get(
  "/createTournament",
  ensureAuthenticated,
  controller.get_create_tournament
);

router.post(
  "/createTournament",
  ensureAuthenticated,
  controller.post_create_tournament
);

router.get(
  "/generateTournamentBracket/:tournamentID",
  ensureAuthenticated,
  controller.generate_tournament_bracket
);

router.get(
  "/:tournamentID",
  ensureAuthenticated,
  controller.get_one_tournament
);

router.post(
  "/saveTournamentBracket/:tournamentID",
  ensureAuthenticated,
  controller.save_tournament_bracket
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
