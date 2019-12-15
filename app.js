var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// SESSION
var session = require("express-session");

// FLASH
var flash = require('connect-flash')

// EXPRESS FILE UPLOAD
const fileUpload = require('express-fileupload');

// // POSTGRE DB CONNECTION
// const { Pool } = require('pg')
// const pool = new Pool({
//     user: 'postgres',
//     host: 'localhost',
//     database: 'dbpms',
//     password: '12345',
//     port: 5432,
// })
// POSTGRE DB CONNECTION
const { Pool } = require('pg')
const pool = new Pool({
    user: 'mlqvazslpleont',
    host: 'ec2-174-129-255-76.compute-1.amazonaws.com',
    database: 'da0391u4vu9jk1',
    password: '06b51d362ceaf350ca5fdc1b2bfc0a962e62c621a683c5d87e11e17ac55b0441',
    port: 5432,
})


var indexRouter = require('./routes/index')(pool);
var usersRouter = require('./routes/users')(pool);
var projectsRouter = require('./routes/project')(pool);
var profileRouter = require('./routes/profile')(pool);

var app = express();

// view engine setup
app.set('views', [path.join(__dirname, 'views')]);
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// SESSION USE
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true
  })
);
// FLASH USE
app.use(flash())
// FILE-UPLOAD USE
app.use(fileUpload());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/projects', projectsRouter);
app.use('/profile', profileRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
