var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/login', function (req, res, next) {
    if (req.session.loggedIn) {
        res.redirect('/etb-chat/home');
    } else {
        res.render('login');
    }

});

router.get('/register', function (req, res, next) {
    res.render('register');
});

router.get('/home', function (req, res, next) {
    //global.sessionStorage.setItem('userInfo',JSON.stringify(req.session.userInfo));
    if(req.session.loggedIn){
        res.render('home', req.session.userInfo);
    }else{
        res.render('login');
    }
    
});

router.get('/home/setting', function (req, res, next) {
    res.render('setting', req.session.userInfo);
});

router.get('/findPwd', function (req, res, next) {
    res.render('findPwd');
});

module.exports = router;
