'use strict';

const passport = module.parent.require('passport');
const passportLocal = module.parent.require('passport-local').Strategy;
const winston = module.parent.require('winston');
const fetch = module.parent.require('node-fetch');
const slugify = module.parent.require('slugify');
const User = require.main.require('./src/user');
const plugin = {};

plugin.login = () => {
    winston.info('[login] Registering new api login strategy');
    passport.use(
        new passportLocal({ passReqToCallback: true }, plugin.continueLogin)
    );
};

plugin.continueLogin = (req, username, password, next) => {
    console.log(`fetching loging for user ${username}`);
    fetch('http://localhost:3000/authenticate', {
        headers: {
            accept: '*/*',
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            login: username,
            password: password,
        }),
        method: 'POST',
    })
        .then((res) => {
            if (res.status !== 200) {
                return next(
                    new Error('[[error:invalid-username-or-password]]')
                );
            }
            return res.json();
        })
        .then(async (user) => {
            let nodeBBUser = await User.getUidByUserslug(
                slugify(user.username)
            );
            if (!nodeBBUser) {
                nodeBBUser = await User.create({
                    username: user.username,
                });
            }
            next(
                null,
                {
                    uid: nodeBBUser,
                },
                '[[success:authentication-successful]]'
            );
        })
        .catch((error) => {
            console.error(error);
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
