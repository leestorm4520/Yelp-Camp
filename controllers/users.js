/**
 * User Controller
 * methods to create, store and manager user
 */

const User = require('../models/user');

// run the HTML page for user registration
module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

// register a new user on the database
module.exports.register = async (req, res, next) => {
    try {
        // get user info from the form input
        const { email, username, password } = req.body;
        // create a new temp user from the info
        const user = new User({ email, username });
        // register on the User database
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}

// run the HTMl page for user login
module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

// login into the current session
module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!');
    // return to campgrounds page after login
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

// logout
module.exports.logout = async (req, res) => {
    req.logout();
    // req.session.destroy();
    req.flash('success', "Goodbye!");
    res.redirect('/campgrounds');
}