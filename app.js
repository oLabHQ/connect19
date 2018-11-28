var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
// require('../config/passport')(passport);
var LocalStrategy = require('passport-local').Strategy;
var Handlebars = require("handlebars");
var hbsHelpers = require('handlebars-helpers');
var multer = require('multer')
var upload = multer({ dest: 'uploads/' })
var mongo = require('mongodb');
var objectId = require('mongodb').ObjectID;
var mongoose = require('mongoose');
var config = require('./config/database');
var cors = require('cors');
var morgan = require('morgan');
var jwt = require('jsonwebtoken');
var MomentHandler = require("handlebars.moment");
MomentHandler.registerHelpers(Handlebars);

Handlebars.registerHelper('with', function (context, options) {
  return options.fn(context);
});

Handlebars.registerHelper('comparegroup', function (array1, gvalue, options) {

  var resultnew = array1.indexOf(gvalue) > -1;

  //console.log(resultnew);
  if (resultnew) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }

});

// Handlebar compare helper
Handlebars.registerHelper('compare', function (lvalue, rvalue, options) {

  if (arguments.length < 3)
    throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

  var operator = options.hash.operator || "==";

  var operators = {
    '==': function (l, r) { return l == r; },
    '===': function (l, r) { return l === r; },
    '!=': function (l, r) { return l != r; },
    '<': function (l, r) { return l < r; },
    '>': function (l, r) { return l > r; },
    '<=': function (l, r) { return l <= r; },
    '>=': function (l, r) { return l >= r; },
    'typeof': function (l, r) { return typeof l == r; }
  }

  if (!operators[operator])
    throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);

  var result = operators[operator](lvalue, rvalue);

  if (result) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }

});

// Connect To Database (OLD CODE)
mongoose.connect(config.database, { useNewUrlParser: true });
// On Connection
mongoose.connection.on('connected', () => {
  console.log('Connected to Database ' + config.database);
});
// On Error
mongoose.connection.on('error', (err) => {
  console.log('Database error ' + err);
});

var routes = require('./routes/index');
var users = require('./routes/users');
var friends = require('./routes/friends');
var admin = require('./routes/admin');
var group = require('./routes/groups');
var announcement = require('./routes/announcement');


Handlebars.registerHelper('user_profile', function() {});

// Init App
var app = express();

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({ extname: '.hbs', defaultLayout: 'layout' }));
app.set('view engine', 'hbs');

// Cors
app.use(cors());

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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

// Express Validator
app.use(expressValidator({
  errorFormatter: function (param, msg, value) {
    var namespace = param.split('.')
      , root = namespace.shift()
      , formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
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


// Static Serving
app.use('/', routes);
app.use('/users', users);
app.use('/friends', friends);
app.use('/admin', admin);
app.use('/groups', group);
app.use('/announcement', announcement);

// API
var apiHomepage = require('./routes/api/homepage');
var apiPost = require('./routes/api/posts');
var apiFlag = require('./routes/api/flags');
var apiTrash = require('./routes/api/trashs');
var apiAnnouncement = require('./routes/api/announcements');
var apiUsers = require('./routes/api/users');
var apiFriends = require('./routes/api/friends');
var apiGroups = require('./routes/api/groups');
app.use('/api/homepage', apiHomepage);
app.use('/api/posts', apiPost);
app.use('/api/flags', apiFlag);
app.use('/api/trashs', apiTrash);
app.use('/api/announcements', apiAnnouncement);
app.use('/api/users', apiUsers);
app.use('/api/friends', apiFriends);
app.use('/api/groups', apiGroups);

// Passport init
app.use(passport.initialize());
// app.use(passport.session());


// Set Port
app.set('port', (process.env.PORT || 3000));



var server = app.listen(app.get('port'), function () {
  console.log('Server started on port ' + app.get('port'));
});


// Chat functonlity socket connection
var io = require("socket.io").listen(server);

io.on('connection', function (socket) {
  socket.on("attach_user_info", function (user_info) {
    socket.member_id = user_info.member_id;
    socket.user_name = user_info.user_name;
    console.log("socket", socket)
  });


  /*
      socket.on("message_from_client", function(usr_msg){    
        //console.log(usr_msg);
        var all_connected_clients = io.sockets.connected;  
       // console.log(all_connected_clients);
        for(var socket_id in all_connected_clients){      
          if(all_connected_clients[socket_id].member_id === usr_msg.friend_member_id){
            var message_object = {"msg": usr_msg.msg, "user_name":socket.user_name, "socket_id": socket_id}
            all_connected_clients[socket_id].emit("message_from_server",message_object);
            break;
          }
        }
        console.log("usr_msg", usr_msg);
      });
  
      */


  /*
   socket.on("message_from_client", function(usr_msg){
     console.log("usr_msg", usr_msg);
   })
   */

  socket.on("join PM", function (rooms) {
    socket.join(rooms.room1);
    socket.join(rooms.room2);
    // console.log(rooms.room1);
    // console.log(rooms.room2);    
  });

  socket.on("message_from_client", function (usr_msg) {
    //console.log(usr_msg);
    var message_object = { "msg": usr_msg.msg, "user_name": usr_msg.username };
    io.to(usr_msg.room).emit("message_from_server", message_object);
  });

});




function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    //req.flash('error_msg','You are not logged in');
    res.redirect('/users/login');
  }
}