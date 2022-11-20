/**
 * User API
 */
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


router.get('/logout', (req, res, next)=>{
    console.log("Inside logout of user routes")
    req.logout(req.user, err=>{
        if(err) return next(err);
        req.flash("success", "Successfully logged out");
        req.session.destroy();
        res.redirect("/");
    })
})

/**
 * Reference link: https://stackoverflow.com/questions/13758207/why-is-passportjs-in-node-not-removing-session-on-logout
 */

module.exports = router;