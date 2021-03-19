const Team = require("../models/Team")

exports.root_get_response = async (req, res) => {
  res.send("teams router")
}
