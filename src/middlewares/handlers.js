exports.response_handler = (path, flashType, flashMsg, req, res, consoleErr = false) => {
  if (consoleErr) console.log(
    '\x1b[31m', // Set console error message colour to red
    `Error: ${consoleErr}`
    ) 
  req.flash(flashType, flashMsg)
  res.redirect(path)
}