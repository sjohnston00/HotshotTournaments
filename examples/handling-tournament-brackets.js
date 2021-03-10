var singleElimination = {
  teams: [
    // Matchups
    ["Team 1", "Team 2"],
    ["Team 3", null]
  ]
};
/**
 * This function finds the next posibble NULL in the teams array and fills it with the
 * @param {Array}  teams - the multidimensional array of teams
 * @param {String}  teamName - the name of the team you would like to fill in
 */
function findNextNull(teams, teamName) {
  for (let i = 0; i < teams.length; i++) {
    const innerArray = teams[i];
    for (let j = 0; j < innerArray.length; j++) {
      if (teams[i][j] === null || teams[i][j] === undefined) {
        teams[i][j] = teamName;
        break;
      }
    }
  }
  return teams;
}

findNextNull(singleElimination.teams, "Team 4");

console.log(singleElimination.teams); //OUTPUT [['Team 1', 'Team 2'], ['Team 3', 'Team 4']]

/**
 * Set a tournament limit of 8
 * Get all the names of the teams
 * Initialize an empty teams array
 */
const tournamentLimit = 16;
let allUsers = [
  "Team 1",
  "Team 2",
  "Team 3",
  "Team 4",
  "Team 5",
  "Team 6",
  "Team 7",
  "Team 8"
];
const teamsArray = [];

for (let index = 0; index < tournamentLimit / 2; index++) {
  const faceOff = addRandomTeams(new Array(2).fill(null));

  teamsArray.push(faceOff);
}
/**
 * Gets the new faceoff of teams and picks random teams from the allUsers array
 * @param {Array} array - the newly cretated array of 2 NULL that will be filled with the names of the teams from the allUsers array
 * @returns The array now filled with 2 random teams that will be facing off against each other
 */
function addRandomTeams(array) {
  for (let index = 0; index < array.length; index++) {
    const randomTeam =
      allUsers[Math.floor(Math.random() * allUsers.length)] || null;
    array[index] = randomTeam;
    allUsers = allUsers.filter((item) => item !== randomTeam);
  }
  return array;
}
console.log(teamsArray);

//Create a tournament with 16 slots filled with null
const emptyTournamentLimit = 16;
const emptyTeamsArray = [];
for (let index = 0; index < emptyTournamentLimit / 2; index++) {
  emptyTeamsArray.push(Array(2).fill(null));
}

console.log(emptyTeamsArray);
