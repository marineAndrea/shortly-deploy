var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

// var db = require('../app/config');
// var User = require('../app/models/user');
// var Link = require('../app/models/link');
var UserMongo = require('../app/database').User;
var LinkMongo = require('../app/database').Link;
// var Users = require('../app/collections/users');
// var Links = require('../app/collections/links');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  LinkMongo.find({}, function(err, users) { // might need to replicate funcitonality of reset
    res.send(200, users);
  });
  // Links.reset().fetch().then(function(links) {
  //   res.send(200, links.models);
  // })
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  LinkMongo.findOne({url: uri}, function(err, link) {

    if (link) {
      res.send(200, link);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }
        var code = util.getCode(uri);
        console.log("making link");
        LinkMongo.create({
          url: uri,
          title: title,
          base_url: req.headers.origin,
          code: code,
          // visits: 0,
        }, function(err, newLink) {
          if (err) throw err;
          console.log(newLink);
          res.send(200, newLink);
        });
      });
    }
  });


  // new Link({ url: uri }).fetch().then(function(found) {
  //   if (found) {
  //     res.send(200, found.attributes);
  //   } else {
  //     util.getUrlTitle(uri, function(err, title) {
  //       if (err) {
  //         console.log('Error reading URL heading: ', err);
  //         return res.send(404);
  //       }

  //       var link = new Link({
  //         url: uri,
  //         title: title,
  //         base_url: req.headers.origin
  //       });

  //       link.save().then(function(newLink) {
  //         Links.add(newLink);
  //         res.send(200, newLink);
  //       });
  //     });
  //   }
  // });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  UserMongo.findOne({ username: username }, function(err, user) {
    if (err) throw err;
    if (!user) {
      res.redirect('/login');
    } else {
      util.comparePassword(user.password, password, function(match) {
        if (match) {
          util.createSession(req, res, user);
        } else {
          res.redirect('/');
        }
      })
    }
  });
  // new User({ username: username })
  //   .fetch()
  //   .then(function(user) {
  //     if (!user) {
  //       res.redirect('/login');
  //     } else {
  //       user.comparePassword(password, function(match) {
  //         if (match) {
  //           util.createSession(req, res, user);
  //         } else {
  //           res.redirect('/login');
  //         }
  //       })
  //     }
  // });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  UserMongo.findOne({ username: username }, function(err, user) {
    if (err) throw err;
    if (!user) {
      util.hashPassword(password, function(hash) {
        UserMongo.create({
          username: username,
          password: hash
        }, function(err, newUser) {
          util.createSession(req, res, newUser);
        })
      })
    } else {
      console.log('Account already exists');
      res.redirect('/signup');
    }
  });
  // new User({ username: username })
  //   .fetch()
  //   .then(function(user) {
  //     if (!user) {
  //       var newUser = new User({
  //         username: username,
  //         password: password
  //       });
  //       newUser.save()
  //         .then(function(newUser) {
  //           util.createSession(req, res, newUser);
  //           Users.add(newUser);
  //         });
  //     } else {
  //       console.log('Account already exists');
  //       res.redirect('/signup');
  //     }
  //   })
};

exports.navToLink = function(req, res) {

  LinkMongo.findOne({ code: req.params[0] }, function(err, link) {
    if (err) throw err;
    if (!link) {
      res.redirect('/');
    } else {
      link.update({visits: link.visits + 1}, function(err) {
        if (err) throw err;
        res.redirect(link.url);
      });
    }
  });
  // new Link({ code: req.params[0] }).fetch().then(function(link) {
  //   if (!link) {
  //     res.redirect('/');
  //   } else {
  //     link.set({ visits: link.get('visits') + 1 })
  //       .save()
  //       .then(function() {
  //         return res.redirect(link.get('url'));
  //       });
  //   }
  // });
};