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

router.put(
  "/:tournamentID",
  ensureAuthenticated,
  controller.update_tournament
);

//DELETE A TOURNAMENT
//THIS SHOULDN'T BE DONE AS WE STILL WANT USERS TO BE ABLE TO SEE PAST TOURNAMENTS
//BUT IT'S NICE TO HAVE THE METHOD THERE
router.get(
  "/deleteTournament/:tournamentID",
  ensureAuthenticated,
  controller.delete_tournament
);

module.exports = router;
