var express = require("express");
var router = express.Router();

//PEMANGGILAN HELPERS
const helpers = require("../helpers/util")

// INVOKE KE POOL DARI APP.JS
module.exports = (db) => {

  // USERS
  router.get("/", helpers.isLoggedIn, (req, res, next) => {
    res.locals.title = "Users"
    let query = `SELECT userid, email, firstname, lastname FROM users`
    db.query(query, (err, users) => {
      // console.log(members.rows);
      res.render("users/listUsers", {
        users: users.rows
      })
    })
  })
  // USERS - ADD USER
  router.get("/adduser", (req, res, next) => {
    res.locals.title = " Users - Add User"
    res.render("users/addUser")
  })
    // USERS - ADD USER - SAVE BUTTON
    router.post("/add-user", (req, res, next) => {
      let query = `INSERT INTO users (email,password,firstname,lastname) VALUES ('${req.body.email}','${req.body.password}','${req.body.firstname}','${req.body.lastname}')`
      db.query(query, () => {
        res.redirect("/users")
      })
    })

  // USERS - EDIT USER
  router.get("/edit/:userid", (req, res, next) => {
    res.locals.title = " Users - Edit User"
    let sql = `SELECT * FROM users WHERE userid = ${req.params.userid}`
    db.query(sql, (err, user)=>{
      res.render("users/editUser", {
        user: user.rows[0]
      })
    })
  })


  // USERS - EDIT USER - SAVE BUTTON
  router.post("/edit-user-save", (req, res, next) => {
    console.log(req.body);
    
    // let query = `INSERT INTO users (email,password,firstname,lastname) VALUES ('${req.body.email}','${req.body.password}','${req.body.firstname}','${req.body.lastname}')`
    // db.query(query, (err, data2) => {
    //   res.redirect("/users")
    // })
  })




  // USERS - DELETE USER BUTTON
  router.get("/delete/:userid", (req, res, next) => {
    console.log(req.params.u);
    let query = `DELETE FROM users WHERE userid = ${req.params.userid}`
    db.query(query, (err)=>{
      res.redirect("/users")
    })
  })


  // \PROJECTS - USERS

  // \SEMENTARA
  return router;
}