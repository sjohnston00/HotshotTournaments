/**
 * @description Generate a tournament bracket for a single users tournament, using the users array in the tournament
 * @param {Object} tournament The tournament from the database
 */
exports.generate_user_bracket = (tournament) => {
  //MAKE A COPY OF THE TOURNAMENT USERS ARRAY
  let tournamentUsers = tournament.users

  for (let index = 0; index < tournament.bracket.teams.length; index++) {
    const currentArray = tournament.bracket.teams[index]
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

exports.generate_team_bracket = () => {}
