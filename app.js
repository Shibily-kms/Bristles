var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var MongoDBSession = require('connect-mongodb-session')(session);
var MongoURI = "mongodb://localhost:27017/sessions"

var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var artistRouter = require('./routes/artist');

var hbs = require('express-handlebars');
var app = express();
var db = require('./config/connection')

var store = new MongoDBSession({
  uri: MongoURI,
  collection: 'Sessions'
  
})

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
app.use(session({
  secret:"key",
  resave:false,
  saveUninitialized:false,
  store:store,
  cookie:{maxAge: 1000 * 60 * 60 * 24 * 30 * 6} // six months 
}))

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
  res.render('error');
});

module.exports = app;
