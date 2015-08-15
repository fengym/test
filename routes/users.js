var express = require('express');
var router = express.Router();
var session = require('express-session');
var AV = require('leanengine');
//add by fengym
var captcha = require('captcha');

var ccap = require('ccap');
var captcha = ccap({
  width:190,
  height:50,
  offset:30,
  quality:100,
  fontsize:40
});

router.get('/captcha', function(req, res, next) {

  var ary = captcha.get();
  console.log(ary[0]);
  req.session.captcha = ary[0];
  res.write(ary[1]);
  res.send();
});

router.get('/login', function(req, res, next) {
  var errMsg = req.query.errMsg;
  res.render('users/login', {title: '用户登录', errMsg: errMsg});
})

router.post('/login', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  var captcha = req.body.captcha;
  if(!(captcha.toUpperCase() === req.session.captcha.toUpperCase())){
    return res.redirect('/users/login?errMsg=验证码错误');
  }
  AV.User.logIn(username, password, {
    success: function(user) {
      res.redirect('/todos');
    },
    error: function(user, err) {
      res.redirect('/users/login?errMsg=' + JSON.stringify(err));
    }
  })
})

router.get('/register', function(req, res, next) {
  var errMsg = req.query.errMsg;
  res.render('users/register', {title: '用户注册', errMsg: errMsg});
});

router.post('/register', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  var captcha = req.body.captcha;
  if (!username || username.trim().length == 0
    || !password || password.trim().length == 0) {
    return res.redirect('/users/register?errMsg=用户名或密码不能为空');
  }
  if(!(captcha.toUpperCase() === req.session.captcha.toUpperCase())){
    return res.redirect('/users/register?errMsg=验证码错误');
  }
  var user = new AV.User();
  user.set("username", username);
  user.set("password", password);
  user.signUp(null, {
    success: function(user) {
      res.redirect('/todos');
    },
    error: function(user, err) {
      res.redirect('/users/register?errMsg=' + JSON.stringify(err));
    }
  })
})

router.get('/logout', function(req, res, next) {
  AV.User.logOut();
  return res.redirect('/users/login');
})

module.exports = router;
