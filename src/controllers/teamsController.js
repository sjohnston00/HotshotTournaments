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
        messages: [],
        limit: tournament.teamsSize || 5 //Get the team size from the tournament, specify the tournament team size when creating a team tournament, else it 5
      })
      const createdTeam = await team.save()
      tournament.teams.push(createdTeam._id)
      await tournament.save();
      req.flash('success_msg', `${createdTeam.name} has been created`)
      return res.redirect(`/tournaments/${tournamentID}`)
      
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
    return handlers.response_handler(
      `/tournaments/${tournamentID}`,
      'error_msg',
      'Something went wrong, please try again later',
      req,
      res,
      error.message
    )
  }
}

exports.view_team_from_tournament = async (req, res) => {
  const { tournamentID, teamID } = req.params

  try {
    const team = await Team.findById(teamID).populate('users').populate({
      path: 'messages',
      select: '-_id -__v -tournament',
      populate: {
        path: 'user',
        model: 'users',
        select: '-_id -__v -password'
      }
    })
    const tournament = await Tournament.findById(tournamentID);
    res.render('teams/view',{
      isLoggedIn: true,
      tournament: tournament,
      team: team
    })
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

}