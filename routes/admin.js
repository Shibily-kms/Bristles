const { response } = require('express');
const express = require('express');
const router = express.Router();
const adminHelpers = require('../helpers/admin-helpers');
const optionHelpers = require('../helpers/option-helper');
const store = require('../config/multer')
const fs = require('fs');
const path = require('path');
const artistHelpers = require('../helpers/artist-helpers');
const userHelper = require('../helpers/user-helpres')

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
// Profile
router.get('/profile', verifyAdmin, (req, res) => {
  let admin = req.session._BR_ADMIN
  let CAT = req.session._BR_CAT
  res.render('admin/profile', { title: "Add Category | Admin panel", admin, CAT, })
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
      title: "Products | Admin panel", admin, CAT, NOW_CAT, productslist, "success": req.session.success
    })
    req.session.success = false
  } else {
    res.render('admin/product-list', { title: "Products | Admin panel", admin, CAT, NOW_CAT, productslist })
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
    res.render('admin/add-product', { title: "Add products | Admin panel", admin, CAT, NOW_CAT, optionHelpers })
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
            return err;
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
    if (req.session.success) {
      res.render('admin/view-product', { title: "View product | Admin panel", admin, CAT, NOW_CAT, product, "success": req.session.success })
      req.session.success = false
    } else {
      res.render('admin/view-product', { title: "View product | Admin panel", admin, CAT, NOW_CAT, product })

    }
  })
});

// All User
router.get('/user-list', verifyAdmin, (req, res) => {
  let admin = req.session._BR_ADMIN
  let CAT = req.session._BR_CAT
  adminHelpers.getAllUser().then((user) => {
    if (req.session.success) {
      res.render('admin/user-list', { title: "User List | Admin panel", admin, CAT, user, 'success': req.session.success })
      req.session.success = false
    } else {
      res.render('admin/user-list', { title: "User List | Admin panel", admin, CAT, user })
    }
  })
})

// Get One User
router.get('/user-list/:urId/view', verifyAdmin, (req, res) => {
  let admin = req.session._BR_ADMIN
  let CAT = req.session._BR_CAT
  let urId = req.params.urId
  userHelper.getUser(urId).then((user) => {
    res.render('admin/view-user', { title: "View User | Admin panel", admin, CAT, user })
  })
});

// Block and Acitve User
router.get('/user-list/:urId/:status', verifyAdmin, (req, res) => {
  adminHelpers.activeAndBlockUser(req.params.urId, req.params.status).then((response) => {
    req.session.success = response.message
    res.redirect('/admin/user-list')
  })
})


// All Pending Artist
router.get('/artist/new-account', verifyAdmin, (req, res) => {
  let admin = req.session._BR_ADMIN
  let CAT = req.session._BR_CAT
  adminHelpers.getAllPendingArtist().then((artist) => {
    if (req.session.success) {
      res.render('admin/artist-pending-list', { title: "Pending Artists | Admin panel", admin, CAT, artist, "success": req.session.success })
      req.session.success = false
    } else if (req.session.error) {
      res.render('admin/artist-pending-list', { title: "Pending Artists | Admin panel", admin, CAT, artist, "error": req.session.error })
      req.session.error = false
    } else {
      res.render('admin/artist-pending-list', { title: "Pending Artists | Admin panel", admin, CAT, artist })
    }
  })
})

// View One Pending Artist
router.get('/artist/new-account/:arId/view', verifyAdmin, (req, res) => {
  let admin = req.session._BR_ADMIN
  let CAT = req.session._BR_CAT
  let arId = req.params.arId
  artistHelpers.getArtist(arId).then((artist) => {
    console.log(artist);
    if (artist.exception) {
      req.session.error = "Invalid Aritist Id"
      res.render('admin/view-pending-artist', { title: "View Artist | Admin panel", admin, CAT, artist, "error": req.session.error })
      req.session.error = false
    } else if (req.session.success) {
      res.render('admin/view-pending-artist', { title: "View Artist | Admin panel", admin, CAT, artist, "success": req.session.success })
      req.session.success = false
    } else {
      res.render('admin/view-pending-artist', { title: "View Artist | Admin panel", admin, CAT, artist })
    }
  })
});


// All Artist
router.get('/artist/all-artist', verifyAdmin, (req, res) => {
  let admin = req.session._BR_ADMIN
  let CAT = req.session._BR_CAT
  adminHelpers.getAllArtist().then((artist) => {
    if (req.session.success) {
      res.render('admin/artist-list', { title: "Artists | Admin panel", admin, CAT, artist, "success": req.session.success })
      req.session.success = false
    } else {
      res.render('admin/artist-list', { title: "Artists | Admin panel", admin, CAT, artist })
    }
  })
});

// View One Artist
router.get('/artist/:arId/view', verifyAdmin, (req, res) => {
  let admin = req.session._BR_ADMIN
  let CAT = req.session._BR_CAT
  let arId = req.params.arId
  artistHelpers.getArtist(arId).then((artist) => {
    
    if (artist.exception) {
      req.session.error = "Invalid Aritist Id"
      res.render('admin/view-artist', { title: "View Artist | Admin panel", admin, CAT, artist, "error": req.session.error })
      req.session.error = false
    } else if (req.session.success) {
      res.render('admin/view-artist', { title: "View Artist | Admin panel", admin, CAT, artist, "success": req.session.success })
      req.session.success = false
    } else {
      res.render('admin/view-artist', { title: "View Artist | Admin panel", admin, CAT, artist })
    }
  })
});


// Approve artist Account
router.get('/artist/:arId/account-approve', verifyAdmin, (req, res) => {
  let arId = req.params.arId
  adminHelpers.approveArtist(arId).then(() => {
    req.session.success = 'Account approved'
    res.redirect('/admin/artist/new-account' + arId + '/view')
  })
});

// Reject Artist Account
router.get('/artist/:arId/account-reject', verifyAdmin, (req, res) => {
  let arId = req.params.arId
  adminHelpers.rejectArtist(arId).then(() => {
    req.session.success = 'Account Rejected'
    res.redirect('/admin/artist/new-account')
  })
});

// Block and Acitve Artist
router.get('/artist/all-artist/:arId/:status', verifyAdmin, (req, res) => {
  adminHelpers.activeAndBlockArtist(req.params.arId, req.params.status).then((response) => {
    req.session.success = response.message
    res.redirect('/admin/artist/all-artist')
  })
})


// Pending Artis Item
router.get('/artist/:arId/pending-items', verifyAdmin, async (req, res) => {
  let arId = req.params.arId
  let admin = req.session._BR_ADMIN
  let CAT = req.session._BR_CAT
  let artist = await artistHelpers.getArtist(arId)
  artistHelpers.getPendingList(arId).then((products) => {
    console.log(products);
    res.render('admin/artist-pending-item', { title: "Pending List | Admin panel", admin, CAT, products, artist })
  })
})

//  Artis Product Item
router.get('/artist/:arId/products', verifyAdmin, async (req, res) => {
  let arId = req.params.arId
  let admin = req.session._BR_ADMIN
  let CAT = req.session._BR_CAT
  let artist = await artistHelpers.getArtist(arId)
  artistHelpers.getAllProducts(arId).then((products) => {
    console.log(products);
    res.render('admin/artist-products-list', { title: "Product List | Admin panel", admin, CAT, products, artist })
  })
})


// Pending Product List
router.get('/pending-products/:_CAT', verifyAdmin, async (req, res) => {
  let admin = req.session._BR_ADMIN
  let CAT = req.session._BR_CAT
  let NOW_CAT = req.params._CAT
  let productslist = await adminHelpers.getAllCatPending(NOW_CAT)
  if (req.session.success) {
    res.render('admin/pending-list', {
      title: "Pending Products | Admin panel", admin, CAT, NOW_CAT, productslist, "success": req.session.success
    })
    req.session.success = false
  } else {
    res.render('admin/pending-list', { title: "Pending Products | Admin panel", admin, CAT, NOW_CAT, productslist })
  }

});

// View Pending Product
router.get('/pending-products/:NOW_CAT/:prId/view', verifyAdmin, (req, res) => {
  let admin = req.session._BR_ADMIN
  let CAT = req.session._BR_CAT
  let NOW_CAT = req.params.NOW_CAT
  let prId = req.params.prId
  adminHelpers.getOneProduct(prId).then((product) => {

    res.render('admin/view-pending', { title: "View product | Admin panel", admin, CAT, NOW_CAT, product })

  })
})

// Approve And Reject Pending Product

router.get('/pending-products/:NOW_CAT/:prId/:choose', verifyAdmin, (req, res) => {
  let NOW_CAT = req.params.NOW_CAT
  let prId = req.params.prId
  let choose = req.params.choose
  adminHelpers.approveAndRejectProduct(prId, choose).then((response) => {
    if (response.approve) {
      req.session.success = "This Product Approved"
      res.redirect('/admin/products/' + NOW_CAT + '/' + prId + '/view')
    } else if (response.reject) {
      req.session.success = "This Product Rejected"
      res.redirect('/admin/pending-products/' + NOW_CAT)
    }
  })
})






module.exports = router;
