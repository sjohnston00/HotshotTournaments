exports.response_handler = (path, flashType, flashMsg, req, res, consoleErr = false) => {
  if (consoleErr) console.log(consoleErr) 
  req.flash('error_msg', error)
  res.redirect(String(path))
}