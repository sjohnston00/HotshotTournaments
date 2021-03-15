const Tournament = require("../models/Tournament");

exports.get_all_users_tournaments = async (req, res) => {
    try {
      const tournaments = await Tournament.find({ users: req.user._id })
        .populate("users", "-_id -__v -password")
        .populate({
          path: "messages",
          select: "-_id -__v -tournament",
          populate: {
            path: "user",
            model: "users",
            select: "-_id -__v -password"
          }
        });
      res.render("tournaments/myTournaments", { tournaments: tournaments });
    } catch (error) {
      //THE FIRST PARAMETER OF THIS FUNCTION IS TO SET THE ERROR MESSAGE IN THE CONSOLE TO A RED COLOUR
      //TODO: FOR THE SAKE OF NOT REPEATING CODE, TURN INTO A FUNCTION
      //E.G handleError('/tournaments/myTournaments', error)
      //First params is where to redirect to and second is the error object from the catch
      console.error("\x1b[31m", `Error: ${error.message}`);
      req.flash("error_msg", "Something went wrong, Please try again later");
      return res.redirect("/");
    }
};