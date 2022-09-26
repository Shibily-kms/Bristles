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

// Address
router.get('/address', verifyUser, userController.getAlladdress)
router.post('/add-address', verifyUser, userController.postAddAddress);
router.post('/edit-address/:adId', verifyUser, userController.postEditAddress);
router.post('/delete-address', verifyUser, userController.deleteAddress)

// Add to cart
router.post('/add-to-cart', verifyTokenOrUser, userController.addToCart);

// Get Cart Count 
router.post('/cart-count', verifyTokenOrUser, userController.getCartCount);

// Cart
router.get('/cart', userController.getCart);
router.post('/remove-from-cart', verifyTokenOrUser, userController.removeFromCart)

// CheckOut 
router.get('/checkout', verifyUser, userController.getCheckOut);
router.post('/change-current-address', verifyUser, userController.changeCurrentAddress);
router.post('/checkCoupon', verifyUser, userController.checkCouponCode)
router.post('/order', verifyUser, userController.postOrder);
router.post('/verify-payment', verifyUser, userController.verifyPayment)

// Order
router.get('/checkout/payment/success', verifyUser, userController.successOrder);
router.get('/checkout/payment/failed', verifyUser, userController.failedOrder)
router.get('/order', verifyUser, userController.getOrder)
router.get('/order/details', verifyUser, userController.getOneOrder);
router.post('/order/cancel', verifyUser, userController.getCancelOrder);
router.post('/pending-payment',verifyUser,userController.pendingPaymentCall)


module.exports = router;
