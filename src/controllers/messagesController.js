const Message = require("../models/Message");
const Tournament = require("../models/Tournament");

exports.post_message_to_tournament = async (req, res) => {
    const { tournamentID } = req.params;
    const message = new Message({
        user: req.user._id,
        isAnnouncement: req.body.isAnnouncement,
        createdAt: new Date(),
        tournament: tournamentID,
        name: req.user.name,
        body: req.body.message
    });

    try {
        const savedMessage = await message.save();
        await Tournament.updateOne(
        { _id: tournamentID },
        { $push: { messages: savedMessage._id } }
        );
        return res.json({ success: true, message: "message successfully added" });
    } catch (error) {
        console.log(error.message);
        req.flash("error_msg", "Something went wrong, please try again later");
        return res.redirect(`/tournaments/${tournamentID}`);
    }
}