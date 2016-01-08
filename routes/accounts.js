var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Models = require('../models/Account');
var router = express.Router();

passport.use(new LocalStrategy(Models.Account.authenticate()));
passport.serializeUser(Models.Account.serializeUser());
passport.deserializeUser(Models.Account.deserializeUser());

router.get('/', function(req, res, next) {
  res.render('account', { user: req.user });
});

router.get('/savesearch', function(req, res, next) {
  res.render('savesearch');
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  }
);

router.post('/register', function(req, res){
  var checkUsername = checkLength(req.body.username, 16);
  var checkEmail = checkLength(req.body.email, 50);
  var checkPassword = checkLength(req.body.password, 16);
  if (checkUsername == false || checkEmail == false || checkPassword == false) {
    return res.redirect('/');
  }
  Models.Account.register(new Models.Account({
      username: req.body.username,
      email: req.body.email
    }),
    req.body.password,
    function(err, account) {
      if (err) {
        return res.render('/', { account: account });
        // message to require registering
      }
      passport.authenticate('local')(req, res, function() {
        res.redirect('/');
      });
    }
  );
});

var checkLength = function(inputToCheck, maxLength) {
  if (inputToCheck.length < 5 || inputToCheck.length > maxLength) {
    return false;
  } else {
    return true;
  }
};

router.post('/savemap', function(req, res){
  var mapDetails = {
    primarycrime: req.body.primarycrime,
    subcrime: req.body.subcrime,
    timeStart: req.body.timeStart,
    timeEnd: req.body.timeEnd
  }
  Models.Account.findOneAndUpdate({
      'username': req.user.username
    },
    {
    }, function(err, account) {
      if (err) console.log(err);
      account.map.push(mapDetails);
      account.save();
    }
  )
  res.redirect('/');
});

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


module.exports = router;
