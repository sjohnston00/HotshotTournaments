const express = require('express')
const router = express.Router()
const { ensureAuthenticated } = require('../config/auth')
const controller = require('../controllers/teamsController')

//VIEW A TEAMS PAGE
router.get(
  '/view/:tournamentID/team/:teamID',
  ensureAuthenticated,
  controller.view_team_from_tournament
)

//UPDATE A TEAM
router.post(
  '/update/:teamID',
  ensureAuthenticated,
  controller.create_new_team_post
)

//CREATE A TEAM
router.post(
  '/:tournamentID',
  ensureAuthenticated,
  controller.create_new_team_post
)

//DELETE TEAM FROM TOURNAMENT
router.get(
  '/:teamID/tournament/:tournamentID/delete',
  ensureAuthenticated,
  controller.delete_team_from_tournament
)

module.exports = router
