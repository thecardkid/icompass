const GoogleStrategy = require('passport-google-oauth2').Strategy;


const adminEmail = 'hieumaster95@gmail.com';
const loginRoute = '/admin/login';


const setupPassport = function(passport, serverConfig) {
  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  passport.use(new GoogleStrategy({
    clientID: '1094593733931-mfmschvlj7sjbhvam9acdsh3dgt7oq7h.apps.googleusercontent.com',
    clientSecret: serverConfig.googleOAuthClientSecret,
    callbackURL: `${serverConfig.appHost}/auth/google/callback`,
  }, function(req, accessToken, refreshToken, profile, done) {
    if (profile.email !== adminEmail) {
      // TODO alert me
      done('not authorized', null);
      return;
    }
    done(null, profile.email);
  }));
}


function ensureAuthenticatedMiddleware(req, res, next) {
  if (!req.session
    || !req.session.passport
    || !req.session.passport.user
    || req.session.passport.user !== adminEmail) {
    res.redirect(loginRoute);
    return;
  }
  next();
}


function installRoutes(app, passport) {
  app.get(loginRoute, passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  }));
  app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: loginRoute,
    successRedirect: '/admin',
  }));
}


module.exports = {
  setUpPassportForGoogleAuth: setupPassport,
  ensureAdminAuthenticatedMiddleware: ensureAuthenticatedMiddleware,
  installRoutes,
};
