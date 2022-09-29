const express = require('express');
const router = express.Router();
const store = require('../config/multer');
const adminController = require('../controllers/admin-controllers')
const middleware = require('../helpers/middleware-helpers')


/* GET users listing. */
router.get('/', middleware.verifyAdmin, adminController.getOverView)

// Admin Sign In
router.get('/sign-in', adminController.getSignIn);
router.post('/sign-in', adminController.postSignIn)

// Admin Sign Out
router.get('/sign-out', adminController.signOut);

// category
router.get('/category', middleware.verifyAdmin, adminController.getCategory)

// Profile
router.get('/profile', middleware.verifyAdmin, adminController.getProfile)

// Add category
router.get('/category/add-category', middleware.verifyAdmin, adminController.getAddCategory)
router.post('/category/add-category', middleware.verifyAdmin, adminController.postAddCategory);

// Edit category
router.get('/category/:id/edit', middleware.verifyAdmin, adminController.getEditCategory);
router.post('/category/:id/edit', middleware.verifyAdmin, adminController.postEditCategory);

// delete Category
router.get('/category/:id/delete', middleware.verifyAdmin, adminController.deleteCategory);

// Product List
router.get('/products/:_CAT', middleware.verifyAdmin, adminController.getProductList)

// Add Products
router.get('/products/:_CAT/add-product', middleware.verifyAdmin, adminController.getAddProduct);
router.post('/products/:NOW_CAT/add-product', middleware.verifyAdmin, store.product.array('image', 4), adminController.postAddProduct);

// Edit Product
router.get('/products/:_CAT/:proId/edit', middleware.verifyAdmin, adminController.getEditProduct);
router.post('/products/:NOW_CAT/edit-product', middleware.verifyAdmin, store.product.array('image', 4), adminController.postEditProduct);

// Delete Product
router.get('/products/:NOW_CAT/:prId/delete', middleware.verifyAdmin, adminController.deleteProduct);

// View Product
router.get('/products/:NOW_CAT/:prId/view', middleware.verifyAdmin, adminController.getViewProduct);

// All User
router.get('/user-list', middleware.verifyAdmin, adminController.getUserList)

// Get One User
router.get('/user-list/:urId/view', middleware.verifyAdmin, adminController.getUserView);

// Block and Acitve User
router.get('/user-list/:urId/:status', middleware.verifyAdmin, adminController.blockAndActiveUser)


// All Pending Artist
router.get('/artist/new-account', middleware.verifyAdmin, adminController.getPendigArtistList)

// View One Pending Artist
router.get('/artist/new-account/:arId/view', middleware.verifyAdmin, adminController.viewOnePendingArtist);


// All Artist
router.get('/artist/all-artist', middleware.verifyAdmin, adminController.getArtistList);

// View One Artist
router.get('/artist/:arId/view', middleware.verifyAdmin, adminController.getOneArtist);


// Approve artist Account
router.get('/artist/:arId/account-approve', middleware.verifyAdmin, adminController.approveArtist);

// Reject Artist Account
router.get('/artist/:arId/account-reject', middleware.verifyAdmin, adminController.rejectArtist);

// Block and Acitve Artist
router.get('/artist/all-artist/:arId/:status', middleware.verifyAdmin, adminController.blockAndActiveArtist)


// Pending Artis Item
router.get('/artist/:arId/pending-items', middleware.verifyAdmin, adminController.getPendingItemOfArtist)

//  Artis Product Item
router.get('/artist/:arId/products', middleware.verifyAdmin, adminController.getArtistProduct)

// Pending Product List
router.get('/pending-products/:_CAT', middleware.verifyAdmin, adminController.getPendingProductList);

// View Pending Product
router.get('/pending-products/:NOW_CAT/:prId/view', middleware.verifyAdmin, adminController.viewOnePendingProduct)

// Approve And Reject Pending Product
router.get('/pending-products/:NOW_CAT/:prId/:choose', middleware.verifyAdmin, adminController.approveOrRejectPendingProduct)

// Carousel
router.get('/carousel', middleware.verifyAdmin, adminController.getCarousel)
router.post('/carousel/add-image', middleware.verifyAdmin, store.carousel.single('image'), adminController.addCarousel)
router.get('/carousel-delete/:crId', middleware.verifyAdmin, adminController.deleteCarousel)

// Coupon
router.get('/coupon', middleware.verifyAdmin, adminController.getAllCoupon)
router.get('/coupon/add', middleware.verifyAdmin, adminController.getAddCoupon)
router.post('/coupon/add', middleware.verifyAdmin, adminController.postAddCoupon)
router.get('/coupon/:cpCode/edit', middleware.verifyAdmin, adminController.getEditCoupon)
router.post('/coupon/edit', middleware.verifyAdmin, adminController.postEditCoupon)
router.get('/coupon/:cpCode/delete', middleware.verifyAdmin, adminController.deleteCoupon)

// Order
router.get('/order-list', middleware.verifyAdmin, adminController.getAllOrder)
router.get('/order-list/details', middleware.verifyAdmin, adminController.getOneOrder)
router.post('/order-list/change-order-status', middleware.verifyAdmin, adminController.changeOrderStatus)

// Payment
router.get('/payment/details', middleware.verifyAdmin, adminController.getOnePaymentDetails)



// catch 404 and forward to error handler
router.use((req, res, next) => {
    next(createError(404));
});

// error handler
router.use((err, req, res, next) => {

    // render the error page
    res.status(err.status || 500);
    res.render('error/admin-404', { layout: 'layout' });
});



module.exports = router;
