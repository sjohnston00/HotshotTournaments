const handlers = require('../middlewares/handlers')
const Team = require('../models/Team')
const Tournament = require('../models/Tournament')

exports.root_get_response = async (req, res) => {
  res.send('teams router')
}
exports.create_new_team_post = async (req, res) => {
  const { newTeam } = req.body
  const { tournamentID } = req.params

  try {
    const tournament = await Tournament.findById(tournamentID)

    try {
      const team = new Team({
        name: newTeam,
        tournament: tournamentID,
        users: [req.user._id],
        teamLeader: req.user._id,
        messages: [],
        limit: tournament.teamsSize || 5 //Get the team size from the tournament, specify the tournament team size when creating a team tournament, else it 5
      })
      const createdTeam = await team.save()
      tournament.teams.push(createdTeam._id)
      if (!tournament.users.includes(req.user._id)) {
        tournament.users.push(req.user._id)
      }
      await tournament.save()
      return handlers.response_handler(
        `/teams/view/${tournamentID}/team/${createdTeam._id}`,
        'success_msg',
        `${createdTeam.name} has been created`,
        req,
        res
      )
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
  //TODO: Validate to make sure the user viewing this page is part of this team
  try {
    const team = await Team.findById(teamID)
      .populate('users')
      .populate({
        path: 'messages',
        select: '-_id -__v -tournament',
        populate: {
          path: 'user',
          model: 'users',
          select: '-_id -__v -password'
        }
      })
    let found = false
    for (let index = 0; index < team.users.length; index++) {
      const user = team.users[index]
      if (user._id.equals(req.user._id)) {
        found = true
        break
      }
    }
    if (!found) {
      return handlers.response_handler(
        `/tournaments/${tournamentID}`,
        'error_msg',
        `You are not a member of ${team.name}`,
        req,
        res
      )
    }
    const tournament = await Tournament.findById(tournamentID)
    const inviteLink = req.protocol + '://' + req.get('host')
    res.render('teams/view', {
      isLoggedIn: true,
      tournament: tournament,
      tournamentID: tournament._id,
      token: tournament.token,
      tournamentTeamInviteLink: `${inviteLink}/tournaments/${tournament._id}/invite/${tournament.inviteCode}/team/${team._id}`,
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
