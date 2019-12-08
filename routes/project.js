var express = require('express');
var router = express.Router();
const helpers = require("../helpers/util")

module.exports = (db) => {

  // PROJECTS HOME PAGE
  router.get("/", helpers.isLoggedIn, (req, res, next) => {
    res.locals.title = "Projects";
    res.locals.user = req.session.user;

    // * QUERY FOR SHOWING DATA TO PROJECTS PAGE
    let sql = `SELECT members.projectid, MAX(projects.name) projectname, STRING_AGG(CONCAT(users.firstname, ' ', users.lastname), ', ') fullname FROM members INNER JOIN projects USING (projectid) INNER JOIN users USING (userid) GROUP BY projectid ORDER BY projectid`
    db.query(sql, (err, projects) => {
      // console.log(projects.rows);
      res.render("project/projects", {
        data: projects.rows
      });
    });
  });

  // ADD PROJECT
  router.get("/add", (req, res, next) => {
    res.locals.title = "Add Project";
    // let sql =
    // "SELECT members.id, members.role, users.firstname, users.lastname FROM members INNER JOIN users ON members.id = users.userid;";
    let sql = `SELECT * FROM users`
    db.query(sql, (err, data) => {
      res.render("project/addProject", {
        members: data.rows
      });
    });
  });

  // ADD PROJECT - SAVE BUTTON
  router.post("/add-save", (req, res, next) => {
    console.log(req.body);
    let sql = `INSERT INTO projects(name) VALUES('${req.body.projectname}')`;
    db.query(sql, (err, projectname) => {

      let sqlselect = `SELECT projectid FROM projects ORDER BY projectid DESC LIMIT 1`
      db.query(sqlselect, (err, select) => {
        let arr = []
        let idProject = select.rows[0].projectid
        let member = req.body.member
        if (typeof req.body.member == 'string') {
          arr.push(`(${member}, ${idProject})`)
        } else {
          member.forEach((item, index) => {
            arr.push(`(${member[index]}, ${idProject})`)
          })
        }
        let sqlsave = `INSERT INTO members (userid, projectid) VALUES ${arr.join(',')}`;
        db.query(sqlsave, (err, data) => {
          // console.log(sqlsave);
          res.redirect('/projects')
        })
      })
    });
  });

  // EDIT PROJECT
  router.get("/edit/:projectid", (req, res, next) => {
    res.locals.title = "Edit Project";
    let sql = `SELECT * FROM projects WHERE projectid = ${req.params.projectid}`;
    db.query(sql, (err, project) => {
      res.render("project/editProject", {
        project: project.rows[0]
      });
    });
  });

  // EDIT SAVE BUTTON
  router.post("/edit/save/:projectid", (req, res, next) => {
    console.log(req.body);
    let sql = `UPDATE projects SET name = '${req.body.projectname}' WHERE projectid = ${req.params.projectid}`;
    db.query(sql, (err, project) => {
      res.redirect("/projects");
    });
  });

  // DELETE PROJECT
  router.get("/delete/:projectid", (req, res, next) => {
    console.log(req.params.projectid);
    let sql = `DELETE FROM members WHERE projectid = ${req.params.projectid}; DELETE FROM projects WHERE projectid = ${req.params.projectid}`;
    db.query(sql, (err, deleteproject) => {
      res.redirect("/projects");
    });
  });


  // PROJECTS - OVERVIEW
  router.get("/overview/:projectid", (req, res, next) => {
    res.locals.title = "Project Details | Overview";
    let sql1 = `SELECT * FROM members JOIN projects ON (members.projectid = ${req.params.projectid} AND projects.projectid = ${req.params.projectid}) JOIN users ON members.userid = users.userid`
    let sql2 = `SELECT * FROM issues WHERE projectid = ${req.params.projectid}`;
    db.query(sql1, (err, data) => {
      db.query(sql2, (err, issues) => {

        // BUG COUNTER
        let bugOpen = 0
        let bugTotal = 0
        issues.rows.forEach((item, index) => {
          if (item.tracker == 'Bug' && item.status !== 'Closed') {
            bugOpen += 1
          }
          if (item.tracker == 'Bug') {
            bugTotal += 1
          }
        })

        // FEATURE COUNTER
        let featureOpen = 0
        let featureTotal = 0
        issues.rows.forEach((item, index) => {
          if (item.tracker == 'Feature' && item.status !== 'Closed') {
            featureOpen += 1
          }
          if (item.tracker == 'Feature') {
            featureTotal += 1
          }
        })

        // SUPPORT COUNTER
        let supportOpen = 0
        let supportTotal = 0
        issues.rows.forEach((item, index) => {
          if (item.tracker == 'Support' && item.status !== 'Closed') {
            supportOpen += 1
          }
          if (item.tracker == 'Support') {
            supportTotal += 1
          }
        })

        res.render("project/overview/overview", {
          data: data.rows,
          issues: issues.rows,
          // ISSUE TRACKING
          bugOpen,
          bugTotal,
          featureOpen,
          featureTotal,
          supportOpen,
          supportTotal
        });
      })

    });
  });


  // ACTIVITY
  router.get("/activity/:projectid", (req, res, next) => {
    res.locals.title = "Project Details | Activity";
    let sql1 = `SELECT * FROM projects WHERE projectid = ${req.params.projectid}`;
    let sql2 = `SELECT * FROM issues WHERE projectid = ${req.params.projectid}`;
    db.query(sql1, (err, data) => {
      db.query(sql2, (err, issues) => {
        console.log(issues.rows);
        res.render("project/overview/activity/listActivity", {
          data: data.rows,
          issues: issues.rows
        })
      });
    });
  });

  // MEMBERS
  // MEMBERS LIST
  router.get("/members/:projectid", (req, res, next) => {
    res.locals.title = "Project Details | Members";
    let sql = `SELECT * FROM members JOIN projects ON (members.projectid = ${req.params.projectid} AND projects.projectid = ${req.params.projectid}) JOIN users ON members.userid = users.userid`;
    db.query(sql, (err, data) => {
      console.log(data.rows);
      // console.log();
      res.render("project/overview/members/listMember", {
        data: data.rows
      });
    });
  });

  // MEMBERS LIST - ADD MEMBER
  router.get("/members/:projectid/add", (req, res, next) => {
    res.locals.title = "Members | Add Member";
    res.render("project/overview/members/addMember")
  })
  // MEMBERS LIST - EDIT MEMBER
  router.get("/members/:projectid/:userid/edit", (req, res, next) => {
    res.locals.title = "Members | Edit Member";
    res.render("project/overview/members/editMember")
  })

  // ISSUES
  // ISSUES LIST
  router.get("/issues/:projectid", (req, res, next) => {
    res.locals.title = "Project Details | Issues";
    let sql1 = `SELECT * FROM projects WHERE projectid = ${req.params.projectid}`;
    let sql2 = `SELECT * FROM issues WHERE projectid = ${req.params.projectid}`;
    db.query(sql1, (err, data) => {
      db.query(sql2, (err, issues) => {
        console.log(issues.rows);
        res.render("project/overview/issues/listIssues", {
          data: data.rows,
          issues: issues.rows
        })
      });
    });
  });

  // ISSUES LIST - ADD ISSUES
  router.get("/issues/:projectid/add", (req, res, next) => {
    res.locals.title = "Project | Add Issues";
    let sql = `SELECT * FROM members JOIN projects ON (members.projectid = ${req.params.projectid} AND projects.projectid = ${req.params.projectid}) JOIN users ON members.userid = users.userid`
    // let sql = `SELECT * FROM projects WHERE projectid = ${req.params.projectid}`
    db.query(sql, (err, data) => {
      // console.log(data.rows);
      res.render("project/overview/issues/addIssues", {
        data: data.rows
      })
    })
  })

  // ISSUES LIST - ADD ISSUES - APPLY
  router.post("/issues/:projectid/add-save", (req, res, next) => {
    let sql = `INSERT INTO issues(projectid,tracker,subject,description,status,priority,assignee,startdate,duedate,estimatedtime,done,files)
    VALUES(${req.params.projectid},'${req.body.tracker}','${req.body.subject}','${req.body.description}','${req.body.status}','${req.body.priority}',${req.body.assignee},'${req.body.startdate}','${req.body.duedate}','${req.body.estimatedtime}',${req.body.done},'${req.body.file}')`
    db.query(sql, (err, data) => {
      res.redirect(`/projects/issues/${req.params.projectid}`)
    })
  })
  //\ PROJECTS

  return router;
}