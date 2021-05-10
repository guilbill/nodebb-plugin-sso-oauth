'use strict';

const passport = module.parent.require('passport');
const passportLocal = module.parent.require('passport-local').Strategy;
const winston = module.parent.require('winston');
const plugin = {};

plugin.login = function () {
    winston.info('[login] Registering new local login strategy');
    passport.use(
        new passportLocal({ passReqToCallback: true }, plugin.continueLogin)
    );
};

plugin.continueLogin = function (req, username, password, next) {
    // Do your stuff here (query API or SQL db, etc...)

    console.log('Try to login');

    // If the login was successful:
    next(
        null,
        {
            uid: 'bobby',
        },
        '[[success:authentication-successful]]'
    );

    // But if the login was unsuccessful, pass an error back, like so:
    next(new Error('[[error:invalid-username-or-password]]'));

    /*
		You'll probably want to add login in this method to determine whether a login
		refers to an existing user (in which case log in as above), or a new user, in
		which case you'd want to create the user by calling User.create. For your
		convenience, this is how you'd create a user:

		var user = module.parent.require('./user');

		user.create({
			username: 'someuser',
			email: 'someuser@example.com'
		});

		Acceptable values are: username, email, password
	*/
};

module.exports = plugin;
