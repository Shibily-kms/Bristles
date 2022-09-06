const { response } = require('express');
var express = require('express');
var router = express.Router();
const adminHelpers = require('../helpers/admin-helpers');
// Middleware
let verifyAdmin = (req, res, next) => {
  if (req.session._BR_ADMIN) {
    next()
  } else {
    res.redirect('/admin/sign-in')
  }
}

/* GET users listing. */
router.get('/', verifyAdmin, (req, res) => {
  let admin = req.session._BR_ADMIN
  res.render('admin/overview', { title: "Overview | Admin panel", admin })
})


// Admin Sign In
router.get('/sign-in', (req, res, next) => {
  if (req.session._BR_ADMIN) {
    res.redirect('/admin')
  } else if (req.session.error) {
    res.render('admin/sign-in', { title: "Admin Sign IN", "error": req.session.error })
    req.session.error = false
  } else {
    res.render('admin/sign-in', { title: "Admin Sign IN" })
  }
});

router.post('/sign-in', (req, res) => {
  adminHelpers.doSignIn(req.body).then((response) => {
    if (response.emailError) {
      req.session.error = "Invalid email address"
      res.redirect('/admin/sign-in')
    } else if (response.passError) {
      req.session.error = "Incorrect password"
      res.redirect('/admin/sign-in')
    } else {
      req.session._BR_ADMIN = response
      res.redirect('/admin')
    }
  })
})

// Admin Sign Out
router.get('/sign-out', (req, res) => {
  req.session._BR_ADMIN = null
  res.redirect('/admin/sign-in')
});


// Product List
router.get('/products/canvas-paint', verifyAdmin, (req, res) => {
  let admin = req.session._BR_ADMIN
  res.render('admin/product-list', { title: "Products | Admin panel", admin, code: "proCN" })
})

// Add Products
router.get('/products/canvas-paint/add-product', verifyAdmin, (req, res) => {
  let category = "Canvas paint"
  let admin = req.session._BR_ADMIN
  res.render('admin/add-product', { title: "Add products | Admin panel", admin, code: "proCN", category })
})

module.exports = router;
