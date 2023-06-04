const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const crypto = require('crypto');
const User = require('../models/User');
require('dotenv').config();

// Tell passport to use a new strategy for Google login
passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      (accessToken, refreshToken, profile, done) => {
        console.log(accessToken);
        console.log(profile);
  
        User.findOne({ username: profile.emails[0].value })
          .then((user) => {
            if (user) {
              return done(null, user);
            } else {
              return User.create({
                name: profile.displayName,
                username: profile.emails[0].value,
                password: crypto.randomBytes(20).toString('hex'),
              }).then((newUser) => {
                return done(null, newUser);
              });
            }
          })
          .catch((err) => {
            console.log('error in strategy', err);
            return done(err, null);
          });
      }
    )
  );
  
passport.serializeUser((user, done) => {
  return done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => {
      return done(null, user);
    })
    .catch((error) => {
      return done(error);
    });
});

module.exports = passport;

