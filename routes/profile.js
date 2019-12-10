var express = require("express");
var router = express.Router();

//PEMANGGILAN HELPERS
const helpers = require("../helpers/util")

// INVOKE KE POOL DARI APP.JS
module.exports = (db) => {

  // PROFILE
  router.get("/", helpers.isLoggedIn, (req, res, next) => {
    res.locals.title = "Profile";
    let sql = `SELECT email,position,jobtype FROM users WHERE email = '${req.session.user.email}'`;
    db.query(sql, (err, profile) => {
      res.render("profile/profile", {
        profile: profile.rows[0]
      });
    });
  });

  // PROFILE UPDATE
  router.post("/update-profile", (req, res, next) => {
    console.log(req.body);
    let sql = `UPDATE users SET password = '${req.body.password}', position = '${req.body.position}', jobtype = '${req.body.jobtype}' WHERE email = '${req.session.user}' `
    db.query(sql, (err, data) => {
      res.redirect("/profile")
    })
  });

  return router;
}