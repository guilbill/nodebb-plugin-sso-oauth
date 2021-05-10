'use strict';

const passport = module.parent.require('passport');
const passportLocal = module.parent.require('passport-local').Strategy;
const winston = module.parent.require('winston');
const slugify = module.parent.require('slugify');
const user = module.parent.require('./user');
const plugin = {};

plugin.login = () => {
    winston.info('[login] Registering new api login strategy');
    passport.use(
        new passportLocal({ passReqToCallback: true }, plugin.continueLogin)
    );
};

plugin.continueLogin = (req, username, password, next) => {
    fetch('http://localhost:3000/admin/login', {
        headers: {
            accept: '*/*',
            'content-type': 'application/json',
        },
        body: `{"login":"${username}","password":"${password}"}`,
        method: 'POST',
    })
        .then(async (user) => {
            let nodeBBUser = await user.exists(slugify(user.login));
            if (!nodeBBUser) {
                nodeBBUser = await create({
                    username: login,
                });
            }
            next(
                null,
                {
                    uid: nodeBBUser.uid,
                },
                '[[success:authentication-successful]]'
            );
        })
        .catch(() => {
            next(new Error('[[error:invalid-username-or-password]]'));
        });

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
