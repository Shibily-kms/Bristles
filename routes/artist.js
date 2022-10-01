const express = require('express');
const router = express.Router();
const store = require('../config/multer')
const artistController = require('../controllers/artist-controllers')
const middleware = require('../helpers/middleware-helpers')


/* GET home page. */
router.get('/', middleware.verifyArtist, artistController.getDashboard);

// User Sign Up
router.get('/sign-up', middleware.verifyAccountConfirm, artistController.getSignUp);
router.post('/sign-up', artistController.postSignUp);
router.post('/sign-up/otp', artistController.postOtp);
router.post('/resend-otp', artistController.resendOTP)

// User Sign In
router.get('/sign-in', middleware.verifyAccountConfirm, artistController.getSignIn);
router.post('/sign-in', artistController.postSignIn);
router.get('/forgot-password', artistController.getForgotPage);
router.post('/forgot-password', artistController.postForgotPassword);
router.post('/forgot-password/new-password', artistController.postForgotOtp)
router.post('/new-password', artistController.setNewPassword)

// User Sign Out
router.get('/sign-out', artistController.signOut);

// Artist Check Account 
router.get('/check-account', artistController.checkAccount);

// Pending List
router.get('/pending-list', middleware.verifyArtist, artistController.getPendingList);

// Add Product
router.get('/product-list/add-product', middleware.verifyArtist, artistController.getAddProduct);
router.post('/product-list/add-product', middleware.verifyArtist, store.product.array('image', 4), artistController.postAddProduct);

// View Pending Product
router.get('/pending-list/:prId/view', middleware.verifyArtist, artistController.viewPendingProduct);

// Edit Pending Product
router.get('/pending-list/:prId/edit', middleware.verifyArtist, artistController.getEditPendingProduct);
router.post('/pending-list/edit-product', middleware.verifyArtist, store.product.array('image', 4), artistController.postEditPendingProduct);

// Delete Pending Product
router.get('/pending-list/:prId/delete', middleware.verifyArtist, artistController.deletePendingProduct);

// Product List
router.get('/product-list', middleware.verifyArtist, artistController.getProductList)

// View  Product
router.get('/product-list/:prId/view', middleware.verifyArtist, artistController.veiwProduct);
router.get('/product-list/:prId/order-status', middleware.verifyArtist, artistController.orderStatus)

// Delete Product
router.get('/product-list/:prId/delete', middleware.verifyArtist, artistController.deleteProduct);

// Profile 
router.get('/profile', middleware.verifyArtist, artistController.getProfile)

// Edit Profile
router.get('/profile/edit', middleware.verifyArtist, artistController.getEditProfile);
router.post('/profile/edit', middleware.verifyArtist, store.artist.single('image'), artistController.postEditProfile);


// Chnage Password
router.get('/change-password', middleware.verifyArtist, artistController.getChangePassword);
router.post('/change-password', middleware.verifyArtist, artistController.postChangePassword)

// Change Email
router.get('/change-email', middleware.verifyArtist, artistController.getChangeEmail);
router.post('/change-email', middleware.verifyArtist,)


// catch 404 and forward to error handler
router.use((req, res, next) => {
    next(createError(404));
});

// error handler
router.use((err, req, res, next) => {

    // render the error page
    res.status(err.status || 500);
    res.render('error/artist-404', { layout: 'layout' });
});


module.exports = router;
