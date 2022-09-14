const express = require('express');
const router = express.Router();
const artistHelper = require('../helpers/artist-helpers')

// middlewear
let verifyArtist = (req, res, next) => {
  if (req.session._BR_ARTIST) {
    next()
  } else {
    res.redirect('/artist/sign-in')
  }
}
let verifyAccountConfirm = (req, res, next) => {
  if (req.session._BR_ARTIST_CHECK) {
    artistHelper.checkAccountActivation(req.session._BR_ARTIST_CHECK_ID).then((response) => {
      if (response) {
        res.redirect('/artist/check-account')
      } else {
        req.session._BR_ARTIST_CHECK_ID = false
        req.session._BR_ARTIST_CHECK = false
        next()
      }
    })
  } else {
    next()
  }
}

/* GET home page. */
router.get('/', verifyArtist, (req, res) => {
  let artist = req.session._BR_ARTIST
  res.render('artist/overview', { title: 'Overview | Bristles', artist });
});

// User Sign Up
router.get('/sign-up', verifyAccountConfirm, (req, res) => {
  if (req.session._BR_ARTIST) {
    res.redirect('/artist')
  } else if (req.session.error) {
    res.render('artist/sign-up', { title: "Sign Up", "error": req.session.error })
    req.session.error = false
  } else {
    res.render('artist/sign-up', { title: "Sign Up" })
  }
});

router.post('/sign-up', (req, res) => {
  artistHelper.doSignUp(req.body).then((response) => {
    if (response.emailError) {
      req.session.error = "Email Id existed"
      res.redirect('/artist/sign-up')
    } else if (response) {
      console.log(response);
      req.session._BR_ARTIST_CHECK_ID = response.insertedId
      req.session._BR_ARTIST_CHECK = true
      res.redirect('/artist/sign-in')
    }
  })
});

// User Sign In
router.get('/sign-in', verifyAccountConfirm, (req, res) => {
  if (req.session._BR_ARTIST) {
    res.redirect('/artist')
  } else if (req.session.error) {
    res.render('artist/sign-in', { title: "Sign In", "error": req.session.error })
    req.session.error = false
  } else {
    res.render('artist/sign-in', { title: "Sign In" })
  }
});

router.post('/sign-in', (req, res) => {
  artistHelper.doSignIn(req.body).then((data) => {
    if (data.emailError) {
      req.session.error = "Invalid email id"
      res.redirect('/artist/sign-in')
    } else if (data.passError) {
      req.session.error = "Incorrect password"
      res.redirect('/artist/sign-in')
    } else if (data) {
      req.session._BR_ARTIST = data
      res.redirect('/artist');
    }
  })
});

// User Sign Out

router.get('/sign-out', (req, res) => {
  req.session._BR_ARTIST = false
  res.redirect('/artist/sign-in')
});

// Artist Check Account 
router.get('/check-account', (req, res) => {
  if (req.session._BR_ARTIST_CHECK_ID) {
    artistHelper.checkAccountActivation(req.session._BR_ARTIST_CHECK_ID).then((response) => {
      if (response.Rejected) {
        req.session._BR_ARTIST_CHECK = false
        res.render('artist/check-account', { title: "Place wait...", rejected: true })
      } else {
        res.render('artist/check-account', { title: "Place wait..." })
      }
    })
  } else {
    req.session._BR_ARTIST_CHECK_ID = false
    req.session._BR_ARTIST_CHECK = false
    res.redirect('/artist/sign-in')
  }
});


module.exports = router;
