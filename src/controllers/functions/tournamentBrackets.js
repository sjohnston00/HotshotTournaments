/**
 * @description Generate a tournament bracket for a single users tournament, using the users array in the tournament
 * @param {Object} tournament The tournament from the database
 */
exports.generate_user_bracket = (tournament) => {
  //MAKE A COPY OF THE TOURNAMENT USERS ARRAY
  let tournamentUsers = tournament.users

  for (let index = 0; index < tournament.bracket.teams.length; index++) {
    const currentArray = new Array(2).fill(null)
    const faceOff = addRandomUsers(currentArray)

    tournament.bracket.teams[index] = faceOff
  }
  function addRandomUsers(array) {
    for (let index = 0; index < array.length; index++) {
      const randomUser =
        tournamentUsers[Math.floor(Math.random() * tournamentUsers.length)]
      if (randomUser == undefined) {
        return array
      } else {
        array[index] = randomUser.name
        tournamentUsers = tournamentUsers.filter(
          (item) => !item._id.equals(randomUser._id)
        )
      }
    }
    return array
  }
  return tournament
}

/**
 * @description Generate a tournament bracket for a teams users tournament, using the teams array in the tournament
 * @param {Object} tournament The tournament from the database, make sure the teams array has been populated
 */
exports.generate_team_bracket = (tournament) => {
  let tournamentTeams = tournament.teams

  for (let index = 0; index < tournament.bracket.teams.length; index++) {
    const currentArray = tournament.bracket.teams[index]
    const faceOff = addRandomUsers(currentArray)

    tournament.bracket.teams[index] = faceOff
  }
  function addRandomUsers(array) {
    for (let index = 0; index < array.length; index++) {
      const randomTeam =
        tournamentTeams[Math.floor(Math.random() * tournamentTeams.length)]
      if (randomTeam == undefined) {
        return array
      } else {
        array[index] = randomTeam.name
        tournamentTeams = tournamentTeams.filter(
          (item) => !item._id.equals(randomTeam._id)
        )
      }
    }
    return array
  }
  return tournament
}
