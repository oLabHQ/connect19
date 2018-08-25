var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Handlebars = require("handlebars");
var hbsHelpers = require('handlebars-helpers');
var MomentHandler = require("handlebars.moment");
MomentHandler.registerHelpers(Handlebars);
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
var mongo = require('mongodb');
var mongoose = require('mongoose');
var config = require('./config/database');



//Handlebars.registerHelper('with', function(context, options) {
//  console.log('hi')
//  return options.fn(context);
//});



// hbsHelpers.register(hbs.handlebars, {});

// For Production
//mongoose.connect('mongodb://c19:connect19@ds215502.mlab.com:15502/connect19', { useNewUrlParser: true });

// For Development
//mongoose.connect('mongodb://localhost:27017/connect19', { useNewUrlParser: true });
//var db = mongoose.connection;

//MONGO_URL = "mongodb://connect19:connect19@ds215502.mlab.com:15502/connect19";
//mongoose.connect(MONGO_URL, {
//  auth: {
//    user: c19,
//    password: connect19
//  }
//})

// Connect To Database (OLD CODE)
mongoose.connect(config.database, { useNewUrlParser: true });
// On Connection
mongoose.connection.on('connected', () => {
  console.log('Connected to Database '+config.database);
});
// On Error
mongoose.connection.on('error', (err) => {
  console.log('Database error '+err);
});

var routes = require('./routes/index');
var users = require('./routes/users');

// Init App
var app = express();

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({extname: '.hbs', defaultLayout:'layout'}));
app.set('view engine', 'hbs');

//var hbs = exphbs.create({
//  helpers: {
//    user_profile: function(something) {
//      console.log(something);
//      return ''+something;
//    }
 // },
//  defaultLayout: 'layout'
//})


// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'dist')));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});



app.use('/', routes);
app.use('/users', users);


// Set Port
app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}