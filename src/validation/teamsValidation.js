/**
 * @description See wether the loggedIn user is part of any team in tournament - validate wether they should be allowed to create another team
 * @param {CoreMongooseArray} teams - The array of teams
 * @param {ObjectId} userId - The logged in users ID
 * @returns A Boolean Based on wether the user was found in the tournament
 */
exports.user_Is_In_Any_Team = (teams, userId) => {
  let found = false
  for (let index = 0; index < teams.length; index++) {
    const team = teams[index]
    for (let index = 0; index < team.users.length; index++) {
      const user = team.users[index]
      if (user.equals(userId)) {
        found = true
        break
      }
    }
    if (found) break
  }
  return found ? true : false
}

/**
 *@description See wether the loggedIn user is part of a team
 * @param {Object} team - The array of teams
 * @param {ObjectId} userId - The logged in users ID
 * @returns A Boolean Based on wether the user was found in the tournament
 */
exports.user_Is_In_Team = (teams, userId) => {
  let found = false
  for (let index = 0; index < teams.length; index++) {
    const team = teams[index]
    for (let index = 0; index < team.users.length; index++) {
      const user = team.users[index]
      if (user.equals(userId)) {
        found = true
        break
      }
    }
    if (found) break
  }
  return found ? true : false
}
/**
 * @description - See wether the user is the leader of the team
 * @param {Object} team - the team
 * @param {Object} userId - the id of the logged in user
 * @returns a boolean
 */
exports.is_team_leader = (team, userId) => {
  return team.teamLeader.equals(userId)
}
