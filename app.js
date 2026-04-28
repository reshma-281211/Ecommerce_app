var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var db=require('./config/connection')
var session=require('express-session')

// view engine setup
/*app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', engine({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: path.join(__dirname, 'views/layout'),
    partialsDir: path.join(__dirname, 'views/layout')
}));*/
const exphbs = require('express-handlebars');
const app = express();
var fileUpload=require('express-fileupload')
app.engine(
  'hbs',
  exphbs.engine({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: path.join(__dirname, 'views/layout'),
    partialsDir: path.join(__dirname, 'views/partials'),
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true
    }
  })
);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/product-images', express.static('public/product-images'))
app.use(fileUpload())
app.use(session({
    secret: "Key",
    resave: false,              // don't save session if nothing changed
    saveUninitialized: true,    // save new sessions
    cookie: { maxAge: 60000 }   // session expires in 1 minute
}));
db.connect((err)=>
{
  if(err)
  {
  console.log("Connection error"+err)
  }
  else
  {
  console.log("Connected DB:", db.get().databaseName);
  console.log("db connected successfully")
  }

})


app.use('/', usersRouter);
app.use('/admin', adminRouter);





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
