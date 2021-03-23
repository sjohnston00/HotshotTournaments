exports.handle_error = (path, error, req, res) => {
  req.flash('error_msg', error)
  res.redirect(String(path))
}