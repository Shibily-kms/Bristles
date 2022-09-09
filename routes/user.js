var express = require('express');
var router = express.Router();
let userHelper = require('../helpers/user-helpres')
const adminHelpers = require('../helpers/admin-helpers');

// middlewear
let verifyUser = (req, res, next) => {
  if (req.session._BR_USER) {
    next()
  } else {
    res.redirect('/sign-in')
  }
}
let verifyTokenOrUser = (req, res, next) => {
  if (req.session._BR_USER) {
    next()
  } else if (req.session._BR_TOKEN) {
    next()
  } else {
    userHelper.setToken().then((token) => {
      req.session._BR_TOKEN = token
      next()
    })
  }
}

/* GET home page. */
router.get('/', async (req, res) => {
  let category = await adminHelpers.getAllCategory()
  for (let i = 0; i < category.length; i++) {
    category[i].no = i + 1
  }
  res.render('user/home', { title: 'Home | Bristles', user: true, category });
});


// User Sign Up
router.get('/sign-up', (req, res) => {
  if (req.session._BR_USER) {
    res.redirect('/')
  } else if (req.session.error) {
    res.render('user/sign-up', { title: "Sign Up", "error": req.session.error })
    req.session.error = false
  } else {
    res.render('user/sign-up', { title: "Sign Up" })
  }
});

router.post('/sign-up', (req, res) => {
  userHelper.doSignUp(req.body).then((response) => {
    if (response.emailError) {
      req.session.error = "Email Id existed"
      res.redirect('/sign-up')
    } else if (response) {
      res.redirect('/sign-in')
    }
  })
});

// User Sign In
router.get('/sign-in', (req, res) => {
  if (req.session._BR_USER) {
    res.redirect('/')
  } else if (req.session.error) {
    res.render('user/sign-in', { title: "Sign In", "error": req.session.error })
    req.session.error = false
  } else {
    res.render('user/sign-in', { title: "Sign In" })
  }
});

router.post('/sign-in', (req, res) => {
  userHelper.doSignIn(req.body).then((data) => {
    if (data.emailError) {
      req.session.error = "Invalid email id"
      res.redirect('/sign-in')
    } else if (data.passError) {
      req.session.error = "Incorrect password"
      res.redirect('/sign-in')
    } else if (data) {
      req.session._BR_USER = data
      res.redirect('/');
    }
  })
});

// User Sign Out

router.get('/sign-out', (req, res) => {
  req.session._BR_USER = false
  res.redirect('/sign-in')
})

// Product List

router.get('/c/:NOW_CAT', (req, res) => {
  let NOW_CAT = req.params.NOW_CAT
  adminHelpers.getAllCatProduct(NOW_CAT).then((product) => {
    res.render('user/product-list', { title: NOW_CAT + ' | Bristles', user: true, product, NOW_CAT })
  })
});

module.exports = router;
