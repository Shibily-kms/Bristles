const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sessionSet = require('./config/connection').sessionSet

const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const artistRouter = require('./routes/artist');

const hbs = require('express-handlebars');
const app = express();
const db = require('./config/connection')


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session Connection with time
app.use(sessionSet)


app.use(function (req, res, next) {
  res.header('Cache-Control', 'no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0');
  next();
})

// MongoDB connection check
db.connect((err)=>{
  if(err) console.log("Connection Error");
  else console.log('Database connected')
})

app.use('/', userRouter);
app.use('/admin', adminRouter);
app.use('/artist', artistRouter);

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
  res.render('error/user-404');
});

module.exports = app;
