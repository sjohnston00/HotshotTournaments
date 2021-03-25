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
    if (!tournament) {
      req.flash('error_msg', 'Not Tournament Found')
      return res.redirect(`/tournaments/myTournaments`)
    }
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
      req.flash('success_msg', `${createdTeam.name} has been created`)
      return res.redirect(`/tournaments/${tournamentID}`)
      
    } catch (error) {
      console.error(error.message)
      req.flash('error_msg', 'Something went wrong, please try again later')
      return res.redirect(`/tournaments/${tournamentID}`)
    }
  } catch (error) {
    console.error(error.message)
    req.flash('error_msg', 'Something went wrong, please try again later')
    return res.redirect(`/tournaments/${tournamentID}`)
  }


}

exports.view_team_from_tournament = async (req, res) => {
  const { tournamentID, teamID } = req.params

  try {
    const team = await Team.findById(teamID).populate('users');
    const tournament = await Tournament.findById(tournamentID);
    res.render('teams/view',{
      tournament: tournament,
      team: team
    })
  } catch (error) {
    
  }

}