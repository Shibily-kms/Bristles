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
  let CAT = req.session._BR_CAT
  res.render('admin/overview', { title: "Overview | Admin panel", admin, CAT })
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
      adminHelpers.getAllCategory().then((category) => {
        req.session._BR_ADMIN = response
        req.session._BR_CAT = category
        res.redirect('/admin')
      })
    }
  })
})

// Admin Sign Out
router.get('/sign-out', (req, res) => {
  req.session._BR_ADMIN = null
  req.session._BR_CAT = null
  res.redirect('/admin/sign-in')
});

// category
router.get('/category', verifyAdmin, (req, res) => {
  let admin = req.session._BR_ADMIN
  let CAT = req.session._BR_CAT
  adminHelpers.getAllCategory().then((category) => {
    if (req.session.success) {
      res.render('admin/category', { title: "Category | Admin panel", admin, CAT, category, "success": req.session.success })
      req.session.success = false
    } else {
      res.render('admin/category', { title: "Category | Admin panel", admin, CAT, category })
    }
  })
})
// Add category
router.get('/category/add-category', verifyAdmin, (req, res) => {
  let admin = req.session._BR_ADMIN
  let CAT = req.session._BR_CAT
  if (req.session.error) {
    res.render('admin/add-category', { title: "Add Category | Admin panel", admin, CAT, "error": req.session.error })
    req.session.error = false
  } else {
    res.render('admin/add-category', { title: "Add Category | Admin panel", admin, CAT })
  }
})

router.post('/category/add-category', verifyAdmin, (req, res) => {

  adminHelpers.addCategory(req.body).then((result) => {
    if (result.nameError) {
      req.session.error = "This title already used"
      res.redirect('/admin/category/add-category')
    } else if (result) {
      adminHelpers.getAllCategory().then((category) => {
        req.session._BR_CAT = category
        req.session.success = "New category created"
        res.redirect('/admin/category')
      })
    }
  })
});

// Edit category
router.get('/category/:id/edit', verifyAdmin, (req, res) => {
  let admin = req.session._BR_ADMIN
  let CAT = req.session._BR_CAT
  adminHelpers.getOneCategroy(req.params.id).then((category) => {
    if (req.session.error) {
      res.render('admin/edit-category', { title: "Edit category | Admin panel", admin, CAT, category, "error": req.session.error })
      req.session.error = false
    } else {
      res.render('admin/edit-category', { title: "Edit category | Admin panel", admin, CAT, category })
    }
  })
});

router.post('/category/:id/edit', verifyAdmin, (req, res) => {
  let id = req.params.id
  adminHelpers.editCategory(req.body, id).then((result) => {
    if (result.nameError) {
      req.session.error = "This category already used"
      res.redirect('/admin/category/' + id + '/edit')
    } else {
      adminHelpers.getAllCategory().then((category)=>{
        req.session._BR_CAT = category
        req.session.success = "New category created"
        res.redirect('/admin/category')
      })
    }
  })
});

// delete Category
router.get('/category/:id/delete', verifyAdmin, (req, res) => {
  adminHelpers.deleteCategory(req.params.id).then(() => {
    adminHelpers.getAllCategory().then((category)=>{
      req.session._BR_CAT = category
      res.redirect('/admin/category')
    })
  })
});


// Product List
router.get('/products/:_CAT', verifyAdmin, (req, res) => {
  let admin = req.session._BR_ADMIN
  let CAT = req.session._BR_CAT
  let NOW_CAT = req.params._CAT
  res.render('admin/product-list', { title: "Products | Admin panel", admin, CAT,NOW_CAT, code: "proCN" })
})

// Add Products
router.get('/products/:_CAT/add-product', verifyAdmin, (req, res) => {
  let category = "Canvas paint"
  let admin = req.session._BR_ADMIN
  let CAT = req.session._BR_CAT
  let NOW_CAT = req.params._CAT
  res.render('admin/add-product', { title: "Add products | Admin panel", admin, CAT,NOW_CAT, code: "proCN", category })
})

module.exports = router;
