exports.response_handler = (path, flashType, flashMsg, req, res, consoleErr = false) => {
  if (consoleErr) console.log(consoleErr) 
  req.flash(flashType, flashMsg)
  res.redirect(String(path))
}