const handlers = require('../middlewares/handlers')
const Team = require("../models/Team")
const Tournament = require("../models/Tournament")

exports.root_get_response = async (req, res) => {
  res.send("teams router")
}
exports.create_new_team_post = async (req,res) => {
  const { newTeam } = req.body
  const { tournamentID } = req.params

  try {
    const tournament = await Tournament.findById(tournamentID);

    try {
      const team = new Team({
        name: newTeam,
        tournament: tournamentID,
        users: [],
        limit: tournament.teamsSize || 5
      })
      const createdTeam = await team.save()
      tournament.teams.push(createdTeam._id)
      await tournament.save();
      
    } catch (error) {
      return handlers.response_handler(
        `/tournaments/${tournamentID}`,
        'error_msg',
        'Something went wrong, please try again later',
        req,
        res,
        error.message
      )
    }
  } catch (error) {
    console.error(error.message)
    req.flash('error_msg', 'Something went wrong, please try again later')
    return res.redirect(`/tournaments/${tournamentID}`)
  }

  req.flash('success_msg', 'New Team Created')
  res.redirect(`/tournaments/${tournamentID}`)

  //Add this new team to the tournament
}

exports.view_team_from_tournament = async (req, res) => {
  const { tournamentID, teamID } = req.params

  res.send(`Viewing Team page from tournament: ${tournamentID} and team is: ${teamID}`)
}