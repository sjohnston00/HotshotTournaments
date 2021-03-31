const handlers = require('../middlewares/handlers')
const tournamentValidation = require('../validation/tournamentValidation')
const brackets = require('./functions/tournamentBrackets')
const moment = require('moment')
const crypto = require('crypto')
const Tournament = require('../models/Tournament')
const Message = require('../models/Message')
const Team = require('../models/Team')
const User = require('../models/User')

exports.get_all_users_tournaments = async (req, res) => {
  try {
    const allTournaments = await Tournament.find({ users: req.user._id })
      .populate('users', '-_id -__v -password')
      .populate({
        path: 'messages',
        select: '-_id -__v -tournament',
        populate: {
          path: 'user',
          model: 'users',
          select: '-_id -__v -password'
        }
      })
    allTournaments.forEach((tournament) => {
      tournament.parsedStartDate = moment(tournament.startDate)
        .utc()
        .local()
        .format('DD/MM/YY, HH:mm')

      tournament.parsedEndDate = moment(tournament.endDate)
        .utc()
        .local()
        .format('DD/MM/YY, HH:mm')

      tournament.parsedDateCreated = moment(tournament.dateCreated)
        .utc()
        .local()
        .format('DD/MM/YY')
    })
    const memberTournaments = allTournaments.filter(
      (tournament) => String(tournament.creator) !== String(req.user._id)
    )
    const userCreatedTournaments = allTournaments.filter(
      (tournament) => String(tournament.creator) === String(req.user._id)
    )
    res.render('tournaments/myTournaments', {
      memberTournaments: memberTournaments,
      isLoggedIn: true,
      userCreatedTournaments: userCreatedTournaments,
      memberTournamentCount: memberTournaments.length,
      userCreatedTournamentCount: userCreatedTournaments.length
    })
  } catch (error) {
    return handlers.response_handler(
      '/',
      'error_msg',
      'Something went wrong, Please try again later',
      req,
      res,
      error.message
    )
  }
}

exports.add_user_to_tournament = async (req, res) => {
  try {
    const { tournamentID, token } = req.params
    const tournament = await Tournament.findOne({
      _id: tournamentID,
      inviteCode: token
    }).populate('teams')

    if (!tournament)
      return handlers.response_handler(
        '/tournaments/myTournaments',
        'error_msg',
        'Tournament not found',
        req,
        res
      )
    if (tournament.users.includes(req.user._id))
      return handlers.response_handler(
        `/tournaments/${tournamentID}`,
        'error_msg',
        'You are already involved with this tournament',
        req,
        res
      )

    if (tournament.users.length >= tournament.limit) {
      return handlers.response_handler(
        '/tournaments/myTournaments',
        'error_msg',
        'Tournament has reached maximum capacity',
        req,
        res
      )
    }
    const today = new Date()

    if (tournament.endDate < today)
      return handlers.response_handler(
        '/tournaments/myTournaments',
        'error_msg',
        'Tournament has already ended',
        req,
        res
      )

    if (tournament.type === 'team') {
      //TODO: Check if its a team tournament then render all the teams of the tournament on a dialog box that allows the user to choose or create a team

      return res.render('tournaments/acceptTournamentInvite', {
        isLoggedIn: true,
        tournamentID: tournament._id,
        inviteToken: tournament.inviteCode,
        TournamentNotFull:
          tournament.teams.length < tournament.limit / tournament.teamSize
            ? true
            : false,
        tournament: tournament
      })
    }

    // Add user to the tournament via ID
    tournament.users.push(req.user._id)
    await tournament.save()
    return handlers.response_handler(
      `/tournaments/${tournamentID}`,
      'success_msg',
      'You are now part of this tournament',
      req,
      res
    )
  } catch (error) {
    return handlers.response_handler(
      '/tournaments/myTournaments',
      'error_msg',
      'Something went wrong, Please try again later',
      req,
      res,
      error.message
    )
  }
}

exports.add_user_to_team_in_tournament = async (req, res) => {
  try {
    const { tournamentID, token, teamID } = req.params
    const tournament = await Tournament.findOne({
      _id: tournamentID,
      inviteCode: token
    }).populate('teams')

    if (!tournament)
      return handlers.response_handler(
        '/tournaments/myTournaments',
        'error_msg',
        'Tournament not found',
        req,
        res
      )
    if (tournament.type !== 'team') {
      return handlers.response_handler(
        '/tournaments/myTournaments',
        'error_msg',
        'This is not a team tournament',
        req,
        res
      )
    }

    if (tournament.users.includes(req.user._id))
      return handlers.response_handler(
        `/tournaments/${tournamentID}`,
        'error_msg',
        'You are already involved with this tournament',
        req,
        res
      )

    if (tournament.users.length >= tournament.limit) {
      return handlers.response_handler(
        '/tournaments/myTournaments',
        'error_msg',
        'Tournament has reached maximum capacity',
        req,
        res
      )
    }
    const today = new Date()

    if (tournament.endDate < today)
      return handlers.response_handler(
        '/tournaments/myTournaments',
        'error_msg',
        'Tournament has already ended',
        req,
        res
      )

    //check wether the user is already part of a team
    //THIS WILL NEVER GET HIT BECAUSE IF THE USER IS ALREADY PART OF THE TOURNAMENT THEN IT WILL REDIRECT ANYWAY
    for (let index = 0; index < tournament.teams.length; index++) {
      const team = tournament.teams[index]
      if (team.users.includes(req.user._id)) {
        return handlers.response_handler(
          `/tournaments/${tournamentID}`,
          'error_msg',
          `You are already part of ${team.name}`,
          req,
          res
        )
      }
    }

    //Add user to the team
    const team = await Team.findById(teamID)
    team.users.push(req.user._id)
    await team.save()
    // Add user to the tournament via ID
    tournament.users.push(req.user._id)
    await tournament.save()
    return handlers.response_handler(
      `/teams/view/${tournamentID}/team/${teamID}`,
      'success_msg',
      `You are now part of this tournaments and a member of ${team.name}`,
      req,
      res
    )
  } catch (error) {
    return handlers.response_handler(
      '/tournaments/myTournaments',
      'error_msg',
      'Something went wrong, Please try again later',
      req,
      res,
      error.message
    )
  }
}

exports.get_create_tournament = (req, res) => {
  const startDate = moment()
    .utc()
    .local()
    .format(moment.HTML5_FMT.DATETIME_LOCAL)
  const endDate = moment()
    .add(1, 'week')
    .utc()
    .local()
    .format(moment.HTML5_FMT.DATETIME_LOCAL)
  res.render('tournaments/createTournament', {
    isLoggedIn: true,
    startDate: startDate,
    endDate: endDate
  })
}
// TODO: Review this function to see if it can be slimmed down
exports.post_create_tournament = async (req, res) => {
  const {
    name,
    description,
    game,
    type,
    startDate,
    endDate,
    size,
    teamSize
  } = req.body
  if (
    !name ||
    !description ||
    !game ||
    !type ||
    !startDate ||
    !endDate ||
    !size
  ) {
    req.flash(
      'error_msg',
      'Name, Description, Game, Type, Size, Start Date and End Date are required'
    )
    return res.redirect('/tournaments/createTournament')
  }
  const nowDate = new Date()
  if (new Date(startDate) < nowDate) {
    req.flash('error_msg', 'Start date cannot be before today')
    return res.redirect('/tournaments/createTournament')
  } else if (new Date(endDate) < nowDate) {
    req.flash('error_msg', 'Ending Date cannot be before today')
    return res.redirect('/tournaments/createTournament')
  } else if (new Date(endDate) < new Date(startDate)) {
    req.flash('error_msg', 'Ending Date cannot be before Starting Date')
    return res.redirect('/tournaments/createTournament')
  }

  //CREATE AN INVITE CODE AND SET THE EXPIRATION DATE TO END DATE
  const buffer = crypto.randomBytes(6)
  const token = buffer.toString('hex')

  //CREATE THE TOURNAMENT BRACKET FROM THE TOURNAMENT limit ;
  const bracket = {
    teams: []
  }
  for (let index = 0; index < Number(size) / 2; index++) {
    bracket.teams.push(Array(2).fill(null))
  }

  let newTournament

  //VALIDATE TOURNAMENT TYPE
  switch (type) {
    case 'single':
      newTournament = new Tournament({
        name: name,
        description: description,
        game: game,
        type: type,
        bracket: bracket,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        messages: [],
        users: [req.user._id],
        creator: req.user._id,
        inviteCode: token,
        inviteCodeExpiryDate: new Date(endDate),
        limit: Number(size)
      })
      break

    case 'team':
      newTournament = new Tournament({
        name: name,
        description: description,
        game: game,
        type: type,
        bracket: bracket,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        messages: [],
        creator: req.user._id,
        teams: [],
        users: [req.user._id],
        inviteCode: token,
        inviteCodeExpiryDate: new Date(endDate),
        limit: Number(size * teamSize),
        teamSize: Number(teamSize)
      })
      break
    default:
      req.flash('error_msg', 'Invalid Tournament Type')
      return res.redirect('/tournaments/createTournament')
  }

  try {
    const savedTournament = await newTournament.save()
    req.flash('success_msg', 'New Tournament Created')
    return res.redirect(`/tournaments/${savedTournament._id}`)
  } catch (error) {
    console.error('\x1b[31m', `Error: ${error.message}`)
    req.flash('error_msg', 'Something went wrong, Please try again later')
    return res.redirect('/tournaments/createTournament')
  }
}

exports.generate_tournament_bracket = async (req, res) => {
  const { tournamentID } = req.params
  const tournament = await tournamentValidation.tournament_exists(tournamentID)
  if (!tournament) {
    return handlers.response_handler(
      '/tournaments/myTournaments',
      'error_msg',
      'Tournament Not Found',
      req,
      res
    )
  }

  const isTournamentCreator = tournamentValidation.is_tournament_creator(
    tournament,
    req.user._id
  )
  if (!isTournamentCreator) {
    return handlers.response_handler(
      `/tournaments/${tournament._id}`,
      'error_msg',
      'You are not the creator of this tournament',
      req,
      res
    )
  }
  switch (tournament.type) {
    case 'single':
      brackets.generate_user_bracket(tournament)
      break

    case 'team':
      brackets.generate_team_bracket(tournament)
      break

    default:
      return handlers.response_handler(
        `/tournaments/myTournaments`,
        'error_msg',
        'Invalid tournament type',
        req,
        res,
        `Please check ${tournament._id} in the database, the tournament type is invalid`
      )
  }

  try {
    tournament.markModified('bracket') //this tells mongoose thats the bracket has been modified so make sure to save it this way
    const savedTournament = await tournament.save()
    return handlers.response_handler(
      `/tournaments/${savedTournament._id}`,
      'success_msg',
      `${savedTournament.name} bracket has been generated`,
      req,
      res
    )
  } catch (error) {
    return handlers.response_handler(
      `/tournaments/myTournaments`,
      'error_msg',
      'Something went wrong, Please try again later',
      req,
      res,
      error.message
    )
  }
}

exports.get_one_tournament = async (req, res) => {
  try {
    const { tournamentID } = req.params
    const tournament = await Tournament.findOne({
      _id: tournamentID
    })
      .populate('users', '-__v -password')
      .populate('teams')
      .populate({
        path: 'messages',
        select: '-__v -tournament',
        populate: {
          path: 'user',
          model: 'users',
          select: '-__v -password'
        }
      })

    const parsedTournament = tournament.toObject()

    parsedTournament.messages.forEach((message) => {
      if (String(message.user._id) === String(req.user._id)) {
        message.isLoggedInUsers = true
      }
    })

    //TODO: VALIDATION SHOULD BE IN ANOTHER FILE
    if (!tournament) {
      req.flash('error_msg', 'Tournament Not Found')
      return res.status(404).redirect('/tournaments/myTournaments')
    }

    //FIND THE USERS ID IN THE TOURNAMENT
    let found = false
    for (let i = 0; i < tournament.users.length; i++) {
      //https://stackoverflow.com/questions/15724272/what-is-the-difference-between-id-and-id-in-mongoose
      if (tournament.users[i].id === req.user.id) {
        found = true
        break
      }
    }

    if (!found) {
      req.flash('error_msg', 'You are not part of this tournament')
      return res.status(401).redirect('/tournaments/myTournaments')
    }

    //Reason why its .id and not _id is because .id is the getter method for the _id as its still treated as a mongo ObjectId
    //https://stackoverflow.com/questions/15724272/what-is-the-difference-between-id-and-id-in-mongoose
    //https://stackoverflow.com/questions/11637353/comparing-mongoose-id-and-strings
    const isTournamentCreator = tournament.creator.equals(req.user._id)
      ? true
      : false
    //GET THE FULL URL SO IT CAN BE USED IN THE TEXTBOX
    //TODO: FIGURE OUT WHY THIS RENDERS THE URL WITH HTTP NOT HTTPS
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl
    res.render('tournaments/viewTournament', {
      tournament: parsedTournament,
      isLoggedIn: true,
      tournamentID: tournament._id,
      tournamentInviteLink: `${fullUrl}/invite/${tournament.inviteCode}`,
      isTournamentCreator: isTournamentCreator,
      isTeamTournament: tournament.type === 'team' ? true : false,
      teamsNotEqualsTournamentSize:
        tournament.teams.length < tournament.limit / tournament.teamSize
          ? true
          : false,
      bracketString: JSON.stringify(tournament.bracket)
      /*REASON: Mustache will not allow front-end script to access the properties that are passed from the server
          therefore I'm having to turn the JSON object to a string, then put the string in a <textarea/> element and hide the element
          then use front-end js to get the string and turn back into a JSON object
          THIS IS WHY I HATE MUSTACHE
        */
    })
  } catch (error) {
    req.flash('error_msg', error.message)
    return res.status(500).redirect('/tournaments/myTournaments')
  }
}

exports.save_tournament_bracket = async (req, res) => {
  const { bracket } = req.body
  const { tournamentID } = req.params

  try {
    const tournament = await Tournament.findById(tournamentID)
    if (!tournament) {
      req.flash('error_msg', 'Tournament Not Found')
      return res.redirect('/tournaments/myTournaments')
    }
    tournament.bracket = JSON.parse(bracket)
    tournament.markModified('bracket')
    const updatedTournament = await tournament.save()
    req.flash('success_msg', 'Tournament bracket saved')
    return res.redirect(`/tournaments/${updatedTournament._id}`)
  } catch (error) {
    console.error('\x1b[31m', `Error: ${error.message}`)
    req.flash('error_msg', 'Something went wrong, Please try again later')
    return res.redirect('/tournaments/myTournaments')
  }
}

exports.update_tournament = async (req, res) => {
  //TODO: VALIDATION SHOULD BE IN SEPERATE FILE
  const { tournamentID } = req.params
  const {
    name,
    description,
    game,
    type,
    startDate,
    endDate,
    messages,
    users
  } = req.body

  if (
    !name ||
    !description ||
    !game ||
    !type ||
    !startDate ||
    !endDate ||
    !messages ||
    !users
  ) {
    req.flash(
      'error_msg',
      'Name, Description, Game, Tournament Type, Start Date, End Date, Messages and Users are required fields'
    )
    return res.redirect(`/tournaments/${tournamentID}`)
  }

  const nowDate = new Date()
  if (new Date(startDate) < nowDate) {
    return res.status(401).send('Starting Date cannot be before today')
  } else if (new Date(endDate) < nowDate) {
    return res.status(401).send('Ending Date cannot be before today')
  } else if (new Date(endDate) < new Date(startDate)) {
    return res.status(401).send('Ending Date cannot be before Start date')
  }

  try {
    const updatedTournament = await Tournament.updateOne(
      { _id: tournamentID },
      {
        $set: {
          name: name,
          description: description,
          game: game,
          type: type,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          messages: messages,
          users: users
        }
      }
    )
    req.flash('success_msg', 'Tournament has been updated')
    return res.redirect(`/tournaments/${updatedTournament._id}`)
  } catch (error) {
    console.error(error.message)
    req.flash('error_msg', 'Something went wrong please try again later')
    return res.redirect(`/tournaments/${updatedTournament._id}`)
  }
}

exports.delete_tournament = async (req, res) => {
  const { tournamentID } = req.params

  //TODO: VALIDATE THAT THIS USER IS THE TOURNAMENT CREATOR
  try {
    const tournament = await Tournament.findById(tournamentID)
    if (!tournament) {
      req.flash('error_msg', 'Could not find tournament')
      return res.redirect('/tournaments/myTournaments')
    }
    if (!tournament.creator.equals(req.user._id)) {
      req.flash('error_msg', 'You are not authorized to delete this tournament')
      return res.redirect('/tournaments/myTournaments')
    }
  } catch (error) {
    console.error(error.message)
    req.flash('error_msg', 'Something went wrong please try again later')
    return res.redirect('/tournaments/myTournaments')
  }

  try {
    const deletedTournament = await Tournament.deleteOne({
      _id: tournamentID
    })
    try {
      // Delete all the messages associated with that tournament
      const messages = await Message.deleteMany({
        tournament: tournamentID
      })
    } catch (error) {
      console.error(
        'Could not find any messages associated with this tournament',
        error.message
      )
      req.flash('error_msg', 'Something went wrong, please try again later')
      return res.redirect('/tournaments/myTournaments')
    }

    req.flash('success_msg', 'Your tournament has been deleted')
    return res.redirect('/tournaments/myTournaments')
  } catch (error) {
    console.error(error.message)
    req.flash('error_msg', 'Something went wrong please try again later')
    return res.redirect(`/tournaments/myTournaments`)
  }
}
exports.kick_user = async (req, res) => {
  const { tournamentID, userID } = req.params

  const tournament = await tournamentValidation.tournament_exists(tournamentID)
  if (!tournament) {
    return handlers.response_handler(
      `/tournaments/myTournaments`,
      'error_msg',
      `Tournament Not Found`,
      req,
      res
    )
  }

  const user = await User.findById(userID)
  if (!user) {
    return handlers.response_handler(
      `/tournaments/myTournaments`,
      'error_msg',
      `User Not Found`,
      req,
      res
    )
  }

  tournament.users = tournament.users.filter((user) => user.id !== userID)

  await tournament.save()

  return handlers.response_handler(
    `/tournaments/${tournament._id}`,
    'success_msg',
    `Successfully removed ${user._id} from tournament`,
    req,
    res
  )
}
