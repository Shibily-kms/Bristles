const express = require('express');
const adminHelpers = require('../helpers/admin-helpers');
const router = express.Router();
const artistHelper = require('../helpers/artist-helpers');
const optionHelpers = require('../helpers/option-helper');
const store = require('../config/multer')
const fs = require('fs');
const path = require('path');
const { getOneProduct } = require('../helpers/admin-helpers');

// middlewear
let verifyArtist = (req, res, next) => {
  if (req.session._BR_ARTIST) {
    artistHelper.checkAccountActive(req.session._BR_ARTIST.arId).then((result) => {
      if (result.activeErr) {
        let artist = req.session._BR_ARTIST
        res.render('artist/blocked-page', { title: 'Account Blocked | Bristles', artist, })
      } else {
        next()
      }
    })
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

// Pdnding List
router.get('/pending-list', verifyArtist, (req, res) => {
  let artist = req.session._BR_ARTIST
  artistHelper.getPendingList(artist.arId).then((productList) => {
    if (req.session.success) {
      res.render('artist/pending-list', { title: 'Pending List | Bristles', artist, productList, "success": req.session.success })
      req.session.success = false
    } else {
      res.render('artist/pending-list', { title: 'Pending List | Bristles', artist, productList })
    }
  })
});

// Add Product
router.get('/product-list/add-product', verifyArtist, async (req, res) => {
  let artist = req.session._BR_ARTIST
  let category = await adminHelpers.getAllCategory()
  if (req.session.success) {
    res.render('artist/add-product', { title: 'Add Product | Bristles', artist, optionHelpers, category, "success": req.session.success })
    req.session.success = false
  } else {
    res.render('artist/add-product', { title: 'Add Product | Bristles', artist, optionHelpers, category, })
  }
});

router.post('/product-list/add-product', verifyArtist, store.product.array('image', 4), (req, res) => {
  let image = []
  for (let i = 0; i < req.files.length; i++) {
    image[i] = req.files[i].filename
  }
  req.body.image = image
  artistHelper.addProduct(req.body).then(() => {
    req.session.success = "New product created"
    res.redirect('/artist/product-list/add-product')
  })
});

// View Pending Product
router.get('/pending-list/:prId/view', verifyArtist, (req, res) => {
  let prId = req.params.prId
  let artist = req.session._BR_ARTIST
  artistHelper.getOneProduct(prId).then((product) => {
    res.render('artist/view-pending', { title: 'View Product | Bristles', artist, product, })
  })
});

// Edit Pending Product
router.get('/pending-list/:prId/edit', verifyArtist, async (req, res) => {
  let prId = req.params.prId
  let artist = req.session._BR_ARTIST
  let category = await adminHelpers.getAllCategory()
  artistHelper.getOneProduct(prId).then((product) => {
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
    for (let i = 0; i < category.length; i++) {
      if (product.category == category[i].title) {
        category[i].option = true
      }
    }
    res.render('artist/edit-product', { title: 'Edit Product | Bristles', artist, product, category, optionHelpers })
  })
});

router.post('/pending-list/edit-product', verifyArtist, store.product.array('image', 4), (req, res) => {
  let image = []
  for (let i = 0; i < req.files.length; i++) {
    image[i] = req.files[i].filename
  }
  req.body.image = image
  artistHelper.editProduct(req.body).then((imageArry) => {
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
    res.redirect('/artist/pending-list/')
  })
});

// Delete Pending Product
router.get('/pending-list/:prId/delete', verifyArtist, (req, res) => {
  artistHelper.deleteProduct(req.params.prId).then((imageArray) => {
    if (imageArray) {
      for (let i = 0; i < imageArray.length; i++) {
        var Imagepath = path.join(__dirname, '../public/images/products/' + imageArray[i])
        fs.unlink(Imagepath, function (err) {
          if (err)
            return err;
        });
      }
    }
    req.session.success = "Product Removed from Database"
    res.redirect('/artist/pending-list/')
  })
});

// Product List
router.get('/product-list', verifyArtist, (req, res) => {
  let artist = req.session._BR_ARTIST
  artistHelper.getAllProducts(artist.arId).then((productList) => {
    if (req.session.success) {
      res.render('artist/product-list', { title: 'Product List | Bristles', artist, productList, "success": req.session.success })
      req.session.success = false
    } else {
      res.render('artist/product-list', { title: 'Product List | Bristles', artist, productList, })
    }
  })
})

// View  Product
router.get('/product-list/:prId/view', verifyArtist, (req, res) => {
  let prId = req.params.prId
  let artist = req.session._BR_ARTIST
  artistHelper.getOneProduct(prId).then((product) => {
    res.render('artist/view-product', { title: 'View Product | Bristles', artist, product, })
  })
});

// Delete Product
router.get('/product-list/:prId/delete', verifyArtist, (req, res) => {
  let prId = req.params.prId
  adminHelpers.deleteProduct(prId).then(() => {
    req.session.success = "This Product deleted"
    res.redirect('/artist/product-list')
  })
});

// Profile 
router.get('/profile', verifyArtist, (req, res) => {
  let artist = req.session._BR_ARTIST
  artistHelper.getArtist(artist.arId).then((artistData) => {
    if (req.session.success) {
      res.render('artist/profile', { title: 'Profile | Bristles', artist, artistData, "success": req.session.success })
      req.session.success = false
    } else {
      res.render('artist/profile', { title: 'Profile | Bristles', artist, artistData })
    }
  })
})

// Edit Profile
router.get('/profile/edit', verifyArtist, (req, res) => {
  let artist = req.session._BR_ARTIST
  artistHelper.getArtist(artist.arId).then((artistData) => {
    res.render('artist/edit-profile', { title: 'Edit profile | Bristles', artist, artistData })
  })
});

router.post('/profile/edit', verifyArtist, store.artist.single('image'), (req, res) => {
  let image = null
  if (req.file) {
    image = req.file.filename
  }
  req.body.image = image
  artistHelper.editProfile(req.body).then((obj) => {
    if (obj.deleteImage) {
      var Imagepath = path.join(__dirname, '../public/images/artist/' + obj.deleteImage)
      fs.unlink(Imagepath, function (err) {
        if (err)
          return err;
      });
    }
    delete obj.deleteImage;
    req.session._BR_ARTIST = obj
    req.session.success = "Profile edited"
    res.redirect('/artist/profile')
  })
});


// Chnage Password
router.get('/change-password', verifyArtist, (req, res) => {
  let artist = req.session._BR_ARTIST
  if (req.session.success) {
    res.render('artist/change-password', { title: 'Change Password | Bristles', artist, "success": req.session.success })
    req.session.success = false
  } else if (req.session.error) {
    res.render('artist/change-password', { title: 'Change Password | Bristles', artist, "error": req.session.error })
    req.session.error = false
  } else {
    res.render('artist/change-password', { title: 'Change Password | Bristles', artist })
  }
});

router.post('/change-password', verifyArtist, (req, res) => {
  artistHelper.changePassword(req.body).then((response) => {
    if (response.passErr) {
      req.session.error = "Incorrect current password"
      res.redirect('/artist/change-password')
    } else {
      req.session.success = "Password changed"
      res.redirect('/artist/change-password')
    }
  })
})

// Change Email

router.get('/change-email', verifyArtist, (req, res) => {
  let artist = req.session._BR_ARTIST
  if (req.session.success) {
    res.render('artist/change-email', { title: 'Change Email | Bristles', artist, "success": req.session.success })
    req.session.success = false
  } else if (req.session.error) {
    res.render('artist/change-email', { title: 'Change Email | Bristles', artist, "error": req.session.error })
    req.session.error = false
  } else {
    res.render('artist/change-email', { title: 'Change Email | Bristles', artist })
  }
});

router.post('/change-email', verifyArtist, (req, res) => {
  artistHelper.changeEmail(req.body).then((response) => {
    if (response.emailErr) {
      req.session.error = "This email already used"
      res.redirect('/artist/change-email')
    } else {
      req.session._BR_ARTIST.email = response
      req.session.success = "Email changed"
      res.redirect('/artist/change-email')
    }
  })
})



module.exports = router;
