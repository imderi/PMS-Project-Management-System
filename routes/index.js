var express = require("express");
var router = express.Router();

// INVOKING HELPERS
const helpers = require("../helpers/util")

// INVOKE TO POOL FROM APP.JS
module.exports = (db) => {

  // SAMPLE
  router.get("/sample",(err, res, next) => {
    res.render("project/overview/overview_partials/sidebar")
  })

  /* GET home page. */
  router.get("/", (req, res, next) => {
    res.render("login", {
      info: req.flash('info')
    });
  });
  

  // AUTHENTICATION FOR LOGIN
  router.post("/auth", (req, res, next) => {
    let {
      email,
      password
    } = req.body;
    db.query(
      `SELECT * FROM users WHERE email = '${email}'`,
      (err, data) => {
        if (data.rows.length > 0) {
          if (data.rows[0].email == email && data.rows[0].password == password ) {
            data.rows[0].password = null;
            req.session.user = data.rows[0];
            res.redirect("/projects");
          }
        }else {
          req.flash('info', "Email & Passwords is wrong")
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

  return router;
}