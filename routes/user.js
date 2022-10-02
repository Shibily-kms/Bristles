const express = require('express');
const router = express.Router();
const store = require('../config/multer');
const userController = require('../controllers/user-controllers');
const middleware = require('../helpers/middleware-helpers')

// middlewear


/* GET home page. */
router.get('/', userController.getHomePage);


// User Sign Up
router.get('/sign-up', userController.getSignUp);
router.post('/sign-up', userController.postSignUp);
router.post('/sign-up/otp', userController.postOtp);
router.post('/resend-otp', userController.resendOTP)

// User Sign In
router.get('/sign-in', userController.getSignIn);
router.post('/sign-in', userController.postSignIn);
router.get('/forgot-password', userController.getForgotPage);
router.post('/forgot-password', userController.postForgotPassword);
router.post('/forgot-password/new-password', userController.postForgotOtp)
router.post('/new-password', userController.setNewPassword)
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
router.get('/profile', middleware.verifyUser, userController.getProfile)

// User Profile Edit
router.get('/profile/edit', middleware.verifyUser, userController.getEditProfile);
router.post('/profile/edit', middleware.verifyUser, store.user.single('image'), userController.postEditProfile);

// Chnage Password
router.get('/profile/change-password', middleware.verifyUser, userController.getChangePassword);
router.post('/profile/change-password', middleware.verifyUser, userController.postChangePassword)

// Change Email
router.get('/profile/change-email', middleware.verifyUser, userController.getChangeEmail);
router.post('/profile/change-email', middleware.verifyUser, userController.postChangeEmail);

// Address
router.get('/address', middleware.verifyUser, userController.getAlladdress)
router.post('/add-address', middleware.verifyUser, userController.postAddAddress);
router.post('/edit-address/:adId', middleware.verifyUser, userController.postEditAddress);
router.post('/delete-address', middleware.verifyUser, userController.deleteAddress)

// Add to cart
router.post('/add-to-cart', middleware.verifyTokenOrUser, userController.addToCart);

// Get Cart Count 
router.post('/cart-count', userController.getCartCount);

// Cart
router.get('/cart', userController.getCart);
router.post('/remove-from-cart', middleware.verifyTokenOrUser, userController.removeFromCart)

// CheckOut 
// router.get('/buy-now/:prId',userController.getBuyNow)
router.get('/checkout', middleware.verifyUser, userController.getCheckOut);
router.post('/change-current-address', middleware.verifyUser, userController.changeCurrentAddress);
router.post('/checkCoupon', middleware.verifyUser, userController.checkCouponCode)
router.post('/order', middleware.verifyUser, userController.postOrder);
router.post('/verify-payment', middleware.verifyUser, userController.verifyPayment)

// Order
router.get('/checkout/payment/success', middleware.verifyUser, userController.successOrder);
router.get('/checkout/payment/failed', middleware.verifyUser, userController.failedOrder)
router.get('/order', middleware.verifyUser, userController.getOrder)
router.get('/order/details', middleware.verifyUser, userController.getOneOrder);
router.get('/order/xl-file',middleware.verifyUser,userController.downloadOrderListXLFile)
router.post('/order/cancel', middleware.verifyUser, userController.getCancelOrder);
router.post('/pending-payment', middleware.verifyUser, userController.pendingPaymentCall)


// WishList
router.post('/wish-product', userController.wishProduct)
router.get('/wishlist', middleware.verifyUser, userController.getAllWishlist);
router.post('/remove-wish-product', middleware.verifyUser, userController.wishProduct)


module.exports = router;
