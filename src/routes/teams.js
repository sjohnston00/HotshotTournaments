const express = require("express");
const router = express.Router();
const Team = require("../models/Team");
const Tournament = require("../models/Tournament");
const { verifyToken } = require("../middlewares/verifyToken");
const controller = require("../controllers/teamsController")

router.get("/", verifyToken, controller.root_get_response);

//CREATE A TEAM
router.post("/:tournamentID", verifyToken, async (req, res) => {
  const { name } = req.body;
  const { tournamentID } = req.params;

  try {
    const team = new Team({
      name: name,
      tournament: tournamentID,
      users: [req.user._id]
    });
    const createdTeam = await team.save();
    res.send(createdTeam);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
