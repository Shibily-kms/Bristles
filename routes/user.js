const express = require('express');
const router = express.Router();
const userHelper = require('../helpers/user-helpres')
const store = require('../config/multer')
const userController = require('../controllers/user-controllers')

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
router.get('/', userController.getHomePage);

// User Sign Up
router.get('/sign-up', userController.getSignUp);
router.post('/sign-up', userController.postSignUp);

// User Sign In
router.get('/sign-in', userController.getSignIn);
router.post('/sign-in', userController.postSignIn);

// User Sign Out
router.get('/sign-out', userController.signOut)

// Product List
router.get('/list/:NOW_CAT', userController.getProductCategoryList);

// View Product
router.get('/list/:NOW_CAT/:prId/view', userController.viewProduct)

// Search
router.get('/search', userController.getSearchPage);
router.post('/get-all-product', userController.getAllProdutInSearch)


// User Profile
router.get('/profile', verifyUser, userController.getProfile)

// User Profile Edit
router.get('/profile/edit', verifyUser, userController.getEditProfile);
router.post('/profile/edit', verifyUser, store.user.single('image'), userController.postEditProfile);

// Chnage Password
router.get('/profile/change-password', verifyUser, userController.getChangePassword);
router.post('/profile/change-password', verifyUser, userController.postChangePassword)

// Change Email

router.get('/profile/change-email', verifyUser, userController.getChangeEmail);
router.post('/profile/change-email', verifyUser, userController.postChangeEmail);

// Add to cart
router.post('/add-to-cart', verifyTokenOrUser,userController.addToCart);

// Get Cart Count 
router.post('/cart-count', verifyTokenOrUser, userController.getCartCount);

// Cart
router.get('/cart', userController.getCart);
router.post('/remove-from-cart', verifyTokenOrUser, )




module.exports = router;
