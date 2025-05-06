const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Incluye email, name y avatar en el token
    const token = jwt.sign(
      {
        userId: req.user._id,
        email: req.user.email,
        name: req.user.name,
        avatar: req.user.avatar
      },
      'secreto',
      { expiresIn: '1d' }
    );
    res.redirect(`http://localhost:3000/login?token=${token}`);
  }
);

module.exports = router;