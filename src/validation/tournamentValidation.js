const Tournament = require('../models/Tournament')

/**
 *
 * @param {ObjectId} tournamentID The ID of the tournament that needs to be found
 * @returns tournament object if found, else FALSE
 */
exports.tournament_exists = async (tournamentID) => {
  try {
    const tournament = await Tournament.findById(tournamentID).populate('users')
    return tournament
  } catch (error) {
    console.error(error.message)
    return false
  }
}

exports.is_tournament_creator = (tournament, userId) => {
  return tournament.creator.equals(userId)
}
