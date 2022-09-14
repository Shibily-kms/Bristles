const { response } = require('express');
const express = require('express');
const router = express.Router();
const adminHelpers = require('../helpers/admin-helpers');
const store = require('../config/multer')
const optionHelpers = require('../helpers/option-helper');
const fs = require('fs');
const path = require('path')

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
    res.render('admin/sign-in', { title: "Admin Sign In", "error": req.session.error })
    req.session.error = false
  } else {
    res.render('admin/sign-in', { title: "Admin Sign In" })
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
      adminHelpers.getAllCategory().then((category) => {
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
    adminHelpers.getAllCategory().then((category) => {
      req.session._BR_CAT = category
      res.redirect('/admin/category')
    })
  })
});


// Product List
router.get('/products/:_CAT', verifyAdmin, async (req, res) => {
  let admin = req.session._BR_ADMIN
  let CAT = req.session._BR_CAT
  let NOW_CAT = req.params._CAT
  let productslist = await adminHelpers.getAllCatProduct(NOW_CAT)
  if (req.session.success) {
    res.render('admin/product-list', {
      title: "Products | Admin panel", admin, CAT, NOW_CAT, code: "proCN", productslist, "success": req.session.success
    })
    req.session.success = false
  } else {
    res.render('admin/product-list', { title: "Products | Admin panel", admin, CAT, NOW_CAT, code: "proCN", productslist })
  }

})

// Add Products
router.get('/products/:_CAT/add-product', verifyAdmin, (req, res) => {
  let admin = req.session._BR_ADMIN
  let CAT = req.session._BR_CAT
  let NOW_CAT = req.params._CAT
  if (req.session.success) {
    res.render('admin/add-product', {
      title: "Add products | Admin panel", admin, CAT, NOW_CAT, "success": req.session.success
    })
    req.session.success = false
  } else {
    res.render('admin/add-product', { title: "Add products | Admin panel", admin, CAT, NOW_CAT, code: "proCN",optionHelpers })
  }
});

router.post('/products/:NOW_CAT/add-product', verifyAdmin, store.product.array('image', 4), (req, res) => {
  let cgId = req.params.NOW_CAT
  let image = []
  for (let i = 0; i < req.files.length; i++) {
    image[i] = req.files[i].filename
  }
  req.body.image = image
  adminHelpers.addProduct(req.body).then(() => {
    req.session.success = "New product created"
    res.redirect('/admin/products/' + cgId + "/add-product")
  })
});

// Edit Product
router.get('/products/:_CAT/:proId/edit', verifyAdmin, (req, res) => {
  let admin = req.session._BR_ADMIN
  let CAT = req.session._BR_CAT
  let NOW_CAT = req.params._CAT
  adminHelpers.getOneProduct(req.params.proId).then((product) => {
    for (let i = 0; i < optionHelpers.medium.length; i++) {
      if (product.medium == optionHelpers.medium[i].name) {
        optionHelpers.medium[i].option = true
      }
    }
    for (let i = 0; i < optionHelpers.surface.length; i++) {
      if (product.surface == optionHelpers.surface[i].name) {
        optionHelpers.surface[i].option = true
      }
    }
    for (let i = 0; i < optionHelpers.quality.length; i++) {
      if (product.quality == optionHelpers.quality[i].name) {
        optionHelpers.quality[i].option = true
      }
    }
    res.render('admin/edit-product', { title: "Edit product | Admin panel", admin, CAT, NOW_CAT, product, optionHelpers })
  })
});

router.post('/products/:NOW_CAT/edit-product', verifyAdmin, store.product.array('image', 4), (req, res) => {
  let cgId = req.params.NOW_CAT
  let image = []
  for (let i = 0; i < req.files.length; i++) {
    image[i] = req.files[i].filename
  }
  req.body.image = image
  adminHelpers.editProduct(req.body).then((imageArry) => {
    if (imageArry) {
      
      for (let i = 0; i < imageArry.length; i++) {
        var Imagepath = path.join(__dirname, '../public/images/products/' + imageArry[i])
        fs.unlink(Imagepath, function (err) {
          if (err)
            return;
        });
      }
    }
    req.session.success = "Product updated"
    res.redirect('/admin/products/' + cgId)
  })
});

// Delete Product
router.get('/products/:NOW_CAT/:prId/delete', verifyAdmin, (req, res) => {
  let NOW_CAT = req.params.NOW_CAT
  let prId = req.params.prId
  adminHelpers.deleteProduct(prId).then(() => {
    req.session.success = "Product removed from list"
    res.redirect('/admin/products/' + NOW_CAT)
  })
});

// View Product
router.get('/products/:NOW_CAT/:prId/view', verifyAdmin, (req, res) => {
  let admin = req.session._BR_ADMIN
  let CAT = req.session._BR_CAT
  let NOW_CAT = req.params.NOW_CAT
  let prId = req.params.prId
  adminHelpers.getOneProduct(prId).then((product) => {
    res.render('admin/view-product', { title: "Edit product | Admin panel", admin, CAT, NOW_CAT, product })
  })
});

// All User
router.get('/user-list',verifyAdmin,(req,res)=>{
  let admin = req.session._BR_ADMIN
  let CAT = req.session._BR_CAT
  adminHelpers.getAllUser().then((user)=>{
    res.render('admin/user-list', { title: "User List | Admin panel", admin, CAT,user})
  })
})

// All Pending Artist
router.get('/artist/new-account',verifyAdmin,(req,res)=>{
  let admin = req.session._BR_ADMIN
  let CAT = req.session._BR_CAT
  adminHelpers.getAllPendingArtist().then((artist)=>{
    res.render('admin/artist-pending-list', { title: "Pending Artists | Admin panel", admin, CAT,artist})
  })
})


// All Artist

router.get('/artist/all-artist',verifyAdmin,(req,res)=>{
  let admin = req.session._BR_ADMIN
  let CAT = req.session._BR_CAT
  adminHelpers.getAllArtist().then((artist)=>{
    res.render('admin/artist-list', { title: "Artists | Admin panel", admin, CAT,artist})
  })
})





module.exports = router;
