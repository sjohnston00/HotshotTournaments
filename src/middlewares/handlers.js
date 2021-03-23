exports.response_handler = (path, error, req, res) => {
  req.flash('error_msg', error)
  res.redirect(String(path))
}