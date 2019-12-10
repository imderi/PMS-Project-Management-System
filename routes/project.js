var express = require('express');
var router = express.Router();
const helpers = require("../helpers/util")
// MOMENT
var moment = require("moment");

module.exports = (db) => {

  // PROJECTS HOME PAGE
  router.get("/", helpers.isLoggedIn, (req, res, next) => {

    res.locals.title = "Projects";
    res.locals.user = req.session.user;

    // PAGINATION

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
    // console.log(req.session.user.userid);
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
    // console.log(req.body);
    let sql = `INSERT INTO projects(name,author) VALUES('${req.body.projectname}',${req.session.user.userid})`;
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
    // console.log(req.body);
    let sql = `UPDATE projects SET name = '${req.body.projectname}' WHERE projectid = ${req.params.projectid}`;
    db.query(sql, (err, project) => {
      res.redirect("/projects");
    });
  });

  // DELETE PROJECT
  router.get("/delete/:projectid", (req, res, next) => {
    // console.log(req.params.projectid);
    let sql = `DELETE FROM members WHERE projectid = ${req.params.projectid}; 
    DELETE FROM issues WHERE projectid = ${req.params.projectid};
    DELETE FROM projects WHERE projectid = ${req.params.projectid}`;
    console.log(sql);
    db.query(sql, (err, ) => {
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
    let sql2 = `SELECT *,(SELECT CONCAT(firstname,' ',lastname) AS author FROM users WHERE userid = activity.author AND projectid = ${req.params.projectid} ) FROM activity WHERE projectid = ${req.params.projectid}`;
    console.log(sql2);
    db.query(sql1, (err, data) => {
      db.query(sql2, (err, issues) => {
        console.log(data.rows);
        console.log(issues.rows);
        // console.log(issues.rows);
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
      res.render("project/overview/members/listMember", {
        data: data.rows
      });
    });
  });

  // MEMBERS LIST - ADD MEMBER SCREEN
  router.get("/members/:projectid/add", (req, res, next) => {
    res.locals.title = "Members | Add Member";
    // SELECT userid,email,CONCAT(firstname,' ',lastname) AS fullname FROM users WHERE userid NOT IN (SELECT userid FROM members WHERE projectid = 14)
    let sql = `SELECT userid,email,CONCAT(firstname,' ',lastname) AS fullname FROM users WHERE userid NOT IN (SELECT userid FROM members WHERE projectid = ${req.params.projectid})`
    db.query(sql, (err, data) => {
      res.render("project/overview/members/addMember", {
        data: data.rows,
        projectid: req.params.projectid
      })
    })
  })

  // MEMBERS LIST - ADD MEMBER - SAVE
  router.post("/members/:projectid/add-save", (req, res, next) => {
    sql = `INSERT INTO members(userid,role,projectid) VALUES(${req.body.userid},'${req.body.position}',${req.params.projectid})`
    // console.log(sql);
    db.query(sql, (err, data) => {
      res.redirect(`/projects/members/${req.params.projectid}`)
    })
  })


  // MEMBERS LIST - EDIT MEMBER
  router.get("/members/:projectid/:userid/edit", (req, res, next) => {
    res.locals.title = "Members | Edit Member";
    let sql = `SELECT * FROM users WHERE userid = ${req.params.userid}`
    db.query(sql, (err, data) => {
      res.render("project/overview/members/editMember", {
        data: data.rows[0],
        projectid: req.params.projectid
      })
    })
  })

  // MEMBERS LIST - EDIT MEMBER - SAVE
  router.post("/members/:projectid/:userid/edit-save", (req, res, next) => {
    console.log(req.params);
    sql = `UPDATE members SET role = '${req.body.position}' WHERE userid = ${req.params.userid} AND projectid = ${req.params.projectid}`
    db.query(sql, (err, data) => {
      console.log(sql);
      res.redirect(`/projects/members/${req.params.projectid}`)
    })
  })

  // MEMBERS LIST - DELETE MEMBER
  router.get("/members/:projectid/:userid/delete", (req, res, next) => {
    let sql = `DELETE FROM members WHERE userid = ${req.params.userid}`
    db.query(sql, (err, data) => {
      res.redirect(`/projects/members/${req.params.projectid}`)
    })
  })

  // ISSUES
  // ISSUES LIST
  router.get("/issues/:projectid", (req, res, next) => {
    res.locals.title = "Project Details | Issues";
    let sql1 = `SELECT * FROM projects WHERE projectid = ${req.params.projectid}`;
    let sql2 = `SELECT * FROM issues WHERE projectid = ${req.params.projectid}`;
    db.query(sql1, (err, data) => {
      db.query(sql2, (err, issues) => {
        console.log(sql2);
        res.render("project/overview/issues/listIssues", {
          data: data.rows,
          issues: issues.rows,
          moment
        })
      });
    });
  });

  // ISSUES LIST - ADD ISSUES
  router.get("/issues/:projectid/add", (req, res, next) => {
    res.locals.title = "Project | Add Issues";
    let sql = `SELECT * FROM members JOIN projects ON (members.projectid = ${req.params.projectid} AND projects.projectid = ${req.params.projectid}) JOIN users ON members.userid = users.userid`
    db.query(sql, (err, data) => {
      res.render("project/overview/issues/addIssues", {
        data: data.rows,
        moment
      })
    })
  })

  // ISSUES LIST - ADD ISSUES - APPLY
  router.post("/issues/:projectid/add-save", (req, res, next) => {
    let sql = `INSERT INTO issues(projectid,tracker,subject,description,status,priority,assignee,author,startdate,duedate,estimatedtime,done,files)
    VALUES(${req.params.projectid},'${req.body.tracker}','${req.body.subject}','${req.body.description}','${req.body.status}','${req.body.priority}',${req.body.assignee},(SELECT author FROM projects WHERE projectid = ${req.params.projectid}),'${req.body.startdate}','${req.body.duedate}','${req.body.estimatedtime}',${req.body.done},'${req.body.file}')`
    db.query(sql, (err, data) => {
      res.redirect(`/projects/issues/${req.params.projectid}`)
    })
  })

  // ISSUES LIST - EDIT ISSUES
  router.get("/issues/:projectid/:issueid/edit", (req, res, nect) => {
    res.locals.title = "Project | Edit Issues";
    let sql1 = `SELECT * FROM issues WHERE issueid = ${req.params.issueid}`
    let sql2 = `SELECT userid,email,CONCAT(firstname,' ',lastname) AS fullname FROM users WHERE userid NOT IN (SELECT userid FROM members WHERE projectid = ${req.params.projectid})`
    db.query(sql1, (err, data) => {
      db.query(sql2, (err, users) => {
        res.render("project/overview/issues/editIssues", {
          data: data.rows[0],
          users: users.rows,
          moment
        })
      })
    })
  })

  // ISSUES LIST - EDIT ISSUES - APPLY
  router.post("/issues/:projectid/edit-save", (req, res, next) => {
    let sql1 = `UPDATE issues SET tracker = '${req.body.tracker}', subject = '${req.body.subject}',
    description = '${req.body.description}', status = '${req.body.status}', priority = '${req.body.priority}',
    assignee = ${req.body.assignee}, startdate = '${req.body.startdate}', duedate = '${req.body.duedate}',
    estimatedtime = '${req.body.estimatedtime}',done = ${req.body.done}, files = '${req.body.file}'`

    let sql2 = `INSERT INTO activity(time,title,description,projectid,author)
    VALUES(NOW(),'${req.body.subject}','[${req.body.tracker}] Subject : ${req.body.subject} - (${req.body.status}) - Done: ${req.body.done}%.',${req.params.projectid},(SELECT author FROM projects WHERE projectid = ${req.params.projectid}))`
    console.log(sql2);
    db.query(sql1, (err, ) => {
      db.query(sql2, (err, ) => {
        res.redirect(`/projects/issues/${req.params.projectid}`)
      })
    })
  })

  // ISSUES LIST - DELETE ISSUES
  router.get("/issues/:projectid/:issueid/delete", (req, res, nect) => {
    res.locals.title = "Project | Edit Issues";
    let sql1 = `DELETE FROM issues WHERE issueid = ${req.params.issueid} AND projectid = ${req.params.projectid} `
    // let sql2 = `INSERT INTO activity(time,title,description,projectid,author)
    // VALUES(NOW(),'${req.body.subject}','Issue was deleted by Userid : ${req.session.user.userid} (${req.session.user.firstname} ${req.session.user.lastname}) : [${req.body.tracker}] Subject : ${req.body.subject} - (${req.body.status}) - Done: ${req.body.done}%.',
    // ${req.params.projectid},(SELECT author FROM projects WHERE projectid = ${req.params.projectid}))`
    db.query(sql1, (err, ) => {
      // db.query(sql2, (err, ) => {
        res.redirect(`/projects/issues/${req.params.projectid}`)
      // } )
    })
  })

  //\ PROJECTS

  return router;
}