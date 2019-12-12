var express = require("express");
var router = express.Router();

//PEMANGGILAN HELPERS
const helpers = require("../helpers/util");

// INVOKE KE POOL DARI APP.JS
module.exports = db => {
  // USERS - LIST
  router.get("/", helpers.isLoggedIn, (req, res, next) => {
    if (req.session.user.isadmin == true) {
      res.locals.title = "Users";
      let query = `SELECT userid, email, firstname, lastname, position, jobtype FROM users`;
      db.query(query, (err, users) => {
        // console.log(members.rows);
        res.render("users/listUsers", {
          users: users.rows,
          isadmin: req.session.user.isadmin

        });
      });
    } else {
      res.send("403 Forbidden")
    }
  });
  // USERS - ADD USER
  router.get("/adduser", (req, res, next) => {
    if (req.session.user.isadmin == true) {
      res.locals.title = " Users - Add User";
      res.render("users/addUser",{
        isadmin: req.session.user.isadmin

      });
    } else {
      res.send("403 Forbidden")
    }
  });
  // USERS - ADD USER - SAVE BUTTON
  router.post("/add-user", (req, res, next) => {
    if (req.session.user.isadmin == true) {
      let sql = `INSERT INTO users (email,password,firstname,lastname,position,jobtype) VALUES ('${req.body.email}','${req.body.password}','${req.body.firstname}','${req.body.lastname}','${req.body.position}','${req.body.jobtype}')`;
      console.log(sql);
      db.query(sql, () => {
        res.redirect("/users");
      });
    } else {
      res.send("403 Forbidden")
    }
  });

  // USERS - EDIT USER
  router.get("/edit/:userid", (req, res, next) => {
    if (req.session.user.isadmin == true) {
      res.locals.title = " Users - Edit User";
      let sql = `SELECT * FROM users WHERE userid = ${req.params.userid}`;
      db.query(sql, (err, user) => {
        res.render("users/editUser", {
          user: user.rows[0],
          isadmin: req.session.user.isadmin

        });
      });
    } else {
      res.send("403 Forbidden")
    }
  });

  // USERS - EDIT USER - SAVE BUTTON
  router.post("/edit/:userid/save", (req, res, next) => {
    if (req.session.user.isadmin == true) {
      let sql = `UPDATE users SET firstname = '${req.body.firstname}',lastname = '${req.body.lastname}',email = '${req.body.email}',password = '${req.body.password}',position = '${req.body.position}',jobtype = '${req.body.jobtype}' WHERE userid = ${req.params.userid}`;
      console.log(sql);
      db.query(sql, err => {
        res.redirect("/users");
      });
    } else {
      res.send("403 Forbidden")
    }
  });

  // USERS - DELETE USER BUTTON
  router.get("/delete/:userid", (req, res, next) => {
    if (req.session.user.isadmin == true) {
      let sql = `DELETE FROM members WHERE userid = ${req.params.userid}; DELETE FROM users WHERE userid = ${req.params.userid}`;
      db.query(sql, err => {
        res.redirect("/users");
      });
    } else {
      res.send("403 Forbidden")
    }
  });

  // \PROJECTS - USERS

  // \SEMENTARA
  return router;
};
