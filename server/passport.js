const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID, // <-- pon aquí tu Client ID
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,  // <-- pon aquí tu Client Secret
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  let user = await User.findOne({ googleId: profile.id });
  if (!user) {
    user = await User.create({
      googleId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      avatar: profile.photos[0].value
    });
  }
  return done(null, user);
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findById(id).then(user => done(null, user));
});