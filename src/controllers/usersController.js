const User = require("../models/User");

exports.delete_all_users = async (req, res) => {
    try {
      const deletedUsers = await User.deleteMany({});
      res.send(deletedUsers);
    } catch (error) {
      res.status(500).send(error.message);
    }
}

exports.login = (req, res) => {};