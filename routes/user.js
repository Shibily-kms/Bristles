const express = require('express');
const router = express.Router();
const userHelper = require('../helpers/user-helpres')
const adminHelpers = require('../helpers/admin-helpers');
const store = require('../config/multer')
const fs = require('fs');
const path = require('path');
const optionHelper = require('../helpers/option-helper');
// const optionHelpers = require('../helpers/option-helper');

// middlewear
let verifyUser = (req, res, next) => {
  if (req.session._BR_USER) {
    userHelper.checkAccountActive(req.session._BR_USER.urId).then((result) => {
      if (result.activeErr) {
        let user = req.session._BR_USER
        res.render('user/blocked-page', { title: 'Account Blocked | Bristles', user, })
      } else {
        next()
      }
    })
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
  let user = req.session._BR_USER
  let category = await adminHelpers.getAllCategory()
  let latestProducts = await userHelper.getLatestProducts()
  let carousel = await adminHelpers.getCarousel()

  res.render('user/home', { title: 'Home | Bristles', category, user, latestProducts, carousel });
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

router.get('/list/:NOW_CAT', (req, res) => {
  let user = req.session._BR_USER
  let NOW_CAT = req.params.NOW_CAT
  adminHelpers.getAllCatProduct(NOW_CAT).then((product) => {
    res.render('user/product-list', { title: NOW_CAT + ' | Bristles', product, NOW_CAT, user })
  })
});

// View Product
router.get('/list/:NOW_CAT/:prId/view', (req, res) => {
  let user = req.session._BR_USER
  let NOW_CAT = req.params.NOW_CAT
  let prId = req.params.prId
  adminHelpers.getOneProduct(prId).then((product) => {

    res.render('user/view-product', { title: 'View Product | Bristles', product, NOW_CAT, user })
  })

})

// Search
router.get('/search', async (req, res) => {
  let user = req.session._BR_USER
  let categoryList = await adminHelpers.getAllCategory()
  let optionList = optionHelper
  res.render('user/search', { title: 'Search | Bristles', toggleIcon: true, categoryList, optionList, user })
});

router.post('/get-all-product', (req, res) => {
  userHelper.getAllProduct().then((product) => {
    res.json(product)
  })
})


// User Profile
router.get('/profile', verifyUser, (req, res) => {
  let user = req.session._BR_USER
  userHelper.getUser(user.urId).then((userData) => {
    if (req.session.success) {
      res.render('user/profile', { title: 'Profile | Bristles', user, userData, "success": req.session.success })
      req.session.success = false
    } else {
      res.render('user/profile', { title: 'Profile | Bristles', user, userData })
    }
  })
})

// User Profile Edit
router.get('/profile/edit', verifyUser, (req, res) => {
  let user = req.session._BR_USER
  userHelper.getUser(user.urId).then((userData) => {
    res.render('user/edit-profile', { title: 'Edit profile | Bristles', user, userData })
  })
});

router.post('/profile/edit', verifyUser, store.user.single('image'), (req, res) => {

  let image = null
  if (req.file) {
    image = req.file.filename
  }
  req.body.image = image
  userHelper.editProfile(req.body).then((obj) => {
    if (obj.deleteImage) {
      var Imagepath = path.join(__dirname, '../public/images/user/' + obj.deleteImage)
      fs.unlink(Imagepath, function (err) {
        if (err)
          return err;
      });
    }
    delete obj.deleteImage;
    req.session._BR_USER = obj
    req.session.success = "Profile edited"
    res.redirect('/profile')
  })
});

// Chnage Password
router.get('/profile/change-password', verifyUser, (req, res) => {
  let user = req.session._BR_USER
  if (req.session.success) {
    res.render('user/change-password', { title: 'Change Password | Bristles', user, "success": req.session.success })
    req.session.success = false
  } else if (req.session.error) {
    res.render('user/change-password', { title: 'Change Password | Bristles', user, "error": req.session.error })
    req.session.error = false
  } else {
    res.render('user/change-password', { title: 'Change Password | Bristles', user })
  }
});

router.post('/profile/change-password', verifyUser, (req, res) => {

  userHelper.changePassword(req.body).then((response) => {
    if (response.passErr) {
      req.session.error = "Incorrect current password"
      res.redirect('/profile/change-password')
    } else {
      req.session.success = "Password changed"
      res.redirect('/profile/change-password')
    }
  })
})

// Change Email

router.get('/profile/change-email', verifyUser, (req, res) => {
  let user = req.session._BR_USER
  if (req.session.success) {
    res.render('user/change-email', { title: 'Change Email | Bristles', user, "success": req.session.success })
    req.session.success = false
  } else if (req.session.error) {
    res.render('user/change-email', { title: 'Change Email | Bristles', user, "error": req.session.error })
    req.session.error = false
  } else {
    res.render('user/change-email', { title: 'Change Email | Bristles', user })
  }
});

router.post('/profile/change-email', verifyUser, (req, res) => {
  userHelper.changeEmail(req.body).then((response) => {
    if (response.emailErr) {
      req.session.error = "This email already used"
      res.redirect('/profile/change-email')
    } else {
      req.session._BR_USER.email = response
      req.session.success = "Email changed"
      res.redirect('/profile/change-email')
    }
  })
})



module.exports = router;
