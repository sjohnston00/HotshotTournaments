const Team = require('../../models/Team')

exports.is_user_in_team = async (tournament, loggedInUser) => {
  let found = false
  for (let index = 0; index < tournament.teams.length; index++) {
    const team = tournament.teams[index]
    for (let index = 0; index < team.users.length; index++) {
      const user = team.users[index]
      if (user.equals(loggedInUser._id)) {
        found = true
        break
      }
    }
    if (found) {
      break
    }
  }
  return found
}
