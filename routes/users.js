const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const users = require('../controllers/users');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

// router.post('/logout', users.logout, (req, res, next)=>{
//     req.logout(req.user, err=>{
//         if(err) return next(err);
//         req.flash("success", "Successfully logged out");
//         res.redirect("/");
//     })
// })
router.post('/logout', (req, res, next)=>{
    req.logout(err=>{
        if(err) return next(err);
        req.flash("success", "Successfully logged out");
        res.redirect("/");
    })
})


module.exports = router;