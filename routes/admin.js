const { response } = require('express');
const express = require('express');
const router = express.Router();
const store = require('../config/multer');
const adminController = require('../controllers/admin-controllers')

// Middleware
let verifyAdmin = (req, res, next) => {
  if (req.session._BR_ADMIN) {
    next()
  } else {
    res.redirect('/admin/sign-in')
  }
}

/* GET users listing. */
router.get('/', verifyAdmin, adminController.getOverView)

// Admin Sign In
router.get('/sign-in', adminController.getSignIn);
router.post('/sign-in', adminController.postSignIn)

// Admin Sign Out
router.get('/sign-out', adminController.signOut);

// category
router.get('/category', verifyAdmin, adminController.getCategory)

// Profile
router.get('/profile', verifyAdmin, adminController.getProfile)

// Add category
router.get('/category/add-category', verifyAdmin, adminController.getAddCategory)
router.post('/category/add-category', verifyAdmin, adminController.postAddCategory);

// Edit category
router.get('/category/:id/edit', verifyAdmin, adminController.getEditCategory);
router.post('/category/:id/edit', verifyAdmin, adminController.postEditCategory);

// delete Category
router.get('/category/:id/delete', verifyAdmin, adminController.deleteCategory);

// Product List
router.get('/products/:_CAT', verifyAdmin, adminController.getProductList)

// Add Products
router.get('/products/:_CAT/add-product', verifyAdmin, adminController.getAddProduct);
router.post('/products/:NOW_CAT/add-product', verifyAdmin, store.product.array('image', 4), adminController.postAddProduct);

// Edit Product
router.get('/products/:_CAT/:proId/edit', verifyAdmin, adminController.getEditProduct);
router.post('/products/:NOW_CAT/edit-product', verifyAdmin, store.product.array('image', 4), adminController.postEditProduct);

// Delete Product
router.get('/products/:NOW_CAT/:prId/delete', verifyAdmin, adminController.deleteProduct);

// View Product
router.get('/products/:NOW_CAT/:prId/view', verifyAdmin, adminController.getViewProduct);

// All User
router.get('/user-list', verifyAdmin, adminController.getUserList)

// Get One User
router.get('/user-list/:urId/view', verifyAdmin, adminController.getUserView);

// Block and Acitve User
router.get('/user-list/:urId/:status', verifyAdmin, adminController.blockAndActiveUser)


// All Pending Artist
router.get('/artist/new-account', verifyAdmin, adminController.getPendigArtistList)

// View One Pending Artist
router.get('/artist/new-account/:arId/view', verifyAdmin, adminController.viewOnePendingArtist);


// All Artist
router.get('/artist/all-artist', verifyAdmin, adminController.getArtistList);

// View One Artist
router.get('/artist/:arId/view', verifyAdmin, adminController.getOneArtist);


// Approve artist Account
router.get('/artist/:arId/account-approve', verifyAdmin, adminController.approveArtist);

// Reject Artist Account
router.get('/artist/:arId/account-reject', verifyAdmin, adminController.rejectArtist);

// Block and Acitve Artist
router.get('/artist/all-artist/:arId/:status', verifyAdmin, adminController.blockAndActiveArtist)


// Pending Artis Item
router.get('/artist/:arId/pending-items', verifyAdmin, adminController.getPendingItemOfArtist)

//  Artis Product Item
router.get('/artist/:arId/products', verifyAdmin, adminController.getArtistProduct)

// Pending Product List
router.get('/pending-products/:_CAT', verifyAdmin, adminController.getPendingProductList);

// View Pending Product
router.get('/pending-products/:NOW_CAT/:prId/view', verifyAdmin, adminController.viewOnePendingProduct)

// Approve And Reject Pending Product
router.get('/pending-products/:NOW_CAT/:prId/:choose', verifyAdmin, adminController.approveOrRejectPendingProduct)

// Carousel
router.get('/carousel', verifyAdmin, adminController.getCarousel)
router.post('/carousel/add-image', verifyAdmin, store.carousel.single('image'), adminController.addCarousel)
router.get('/carousel-delete/:crId', verifyAdmin, adminController.deleteCarousel)

// Coupon
router.get('/coupon',verifyAdmin,adminController.getAllCoupon)
router.get('/coupon/add',verifyAdmin,adminController.getAddCoupon)
router.post('/coupon/add',verifyAdmin,adminController.postAddCoupon)
router.get('/coupon/:cpCode/edit',verifyAdmin,adminController.getEditCoupon)
router.post('/coupon/edit',verifyAdmin,adminController.postEditCoupon)
router.get('/coupon/:cpCode/delete',verifyAdmin,adminController.deleteCoupon)

// Order
router.get('/order-list',verifyAdmin,adminController.getAllOrder)
router.get('/order-list/details',verifyAdmin,adminController.getOneOrder)
router.post('/order-list/change-order-status',verifyAdmin,adminController.changeOrderStatus)


module.exports = router;
