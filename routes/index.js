var express = require("express");
var router = express.Router();

//PEMANGGILAN HELPERS
const helpers = require("../helpers/util")

// INVOKE KE POOL DARI APP.JS
module.exports = (db) => {

  /* GET home page. */
  router.get("/", (req, res, next) => {
    res.render("login");
  });

  // AUTHENTICATION UNTUK LOGIN
  router.post("/auth", (req, res, next) => {
    let {
      email,
      password
    } = req.body;
    db.query(
      `SELECT email,password FROM users WHERE email = '${email}'`,
      (err, data) => {
        // console.log(data.rows[0].email);
        if (data.rows[0] == undefined) {
          res.redirect("/");
        } else if (
          data.rows[0].email == email &&
          data.rows[0].password == password
        ) {
          req.session.user = email;
          res.redirect("/projects");
        } else {
          res.redirect("/");
        }
      }
    );
  });

  // LOG OUT
  router.get("/logout", helpers.isLoggedIn, (req, res, next) => {
    req.session.destroy();
    res.redirect("/");
  });

  // PROFILE
  router.get("/profile", helpers.isLoggedIn, (req, res, next) => {
    res.locals.title = "Profile";
    let sql = `SELECT email FROM users WHERE email = '${req.session.user}'`;
    db.query(sql, (err, profile) => {
      res.render("profile/profile", {
        profile: profile.rows[0]
      });
    });
  });

  // PROFILE UPDATE
  router.post("/profile/update", (req, res, next) => {
    if (req.body.password) {
      let sql = `UPDATE users SET password = '${req.body.password}'`;
      db.query(sql, (err, profile) => {
        res.redirect("/profile");
      });
    } else {
      console.log('PASSWORD KOSONG');
      res.redirect("/profile");
    }
  });

  return router;
}