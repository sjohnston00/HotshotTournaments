const express = require("express");
const router = express.Router();

//GET ALL TOURNAMENTS
router.get("/", (req, res) => {});

//GET ALL USERS TOURNAMENTS
router.get("/", (req, res) => {});

//GET 1 TOURNAMENT
router.get("/", (req, res) => {});

//CREATE A NEW TOURNAMENT
router.post("/", (req, res) => {});

//UPDATE A TOURNAMENT
router.put("/:tournamentID", (req, res) => {});

//DELETE A TOURNAMENT
//THIS SHOULDN'T BE DONE AS WE STILL WANT USERS TO BE ABLE TO SEE PAST TOURNAMENTS
//BUT ITS NICE TO HAVE THE METHOD THERE
router.delete("/:tournamentID", (req, res) => {});

module.exports = router;
