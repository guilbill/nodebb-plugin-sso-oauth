'use strict';

const passport = module.parent.require('passport');
const CustomStrategy = require('passport-custom').Strategy;
const winston = module.parent.require('winston');
const fetch = module.parent.require('node-fetch');
const User = require.main.require('./src/user');
const authenticationController = require.main.require(
    './src/controllers/authentication'
);
const plugin = {};
const util = require('util');

plugin.login = () => {
    winston.info('[login] Registering new api login strategy');
    passport.use(
        'apiAuth',
        new CustomStrategy((req, done) => {
            console.log(`Try to get user by cookie ${req.cookies.token}`);
            fetch('http://api.1859.com/api/user/profile', {
                headers: {
                    accept: '*/*',
                    Authorization: `Token ${req.cookies.token}`,
                },
                method: 'GET',
            })
                .then(async (response) => {
                    const user = await response.json();
                    user.username = user.login;
                    console.log(`got user via cookie ${user.username}`);
                    let nodeBBUser = await User.getUidByUserslug(user.username);
                    if (!nodeBBUser) {
                        nodeBBUser = await User.create({
                            username: user.username,
                        });
                    }
                    user.uid = nodeBBUser;
                    console.log(`And calling callback, for ${user.uid}`);
                    authenticationController.onSuccessfulLogin(req, nodeBBUser);
                    done(null, user);
                })
                .catch((error) => {
                    console.error(error);
                    done(error);
                });
        })
    );
};

plugin.load = (params, callback) => {
    params.router &&
        params.router.use((req, res, next) => {
            console.log(`is logged? ${req.uid}`);
            console.log(req.uid);
            if (req.uid || req.url.indexOf('/assets/') !== -1) {
                return next();
            }
            passport.authenticate('apiAuth')(req, res, next);
        });
    callback && callback();
};

module.exports = plugin;
