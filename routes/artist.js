const express = require('express');
const adminHelpers = require('../helpers/admin-helpers');
const router = express.Router();
const store = require('../config/multer')
const artistHelper = require('../helpers/artist-helpers');
const artistController = require('../controllers/artist-controllers')

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
router.get('/', verifyArtist, artistController.getOverView);

// User Sign Up
router.get('/sign-up', verifyAccountConfirm, artistController.getSignUp);
router.post('/sign-up', artistController.postSignUp);

// User Sign In
router.get('/sign-in', verifyAccountConfirm, artistController.getSignIn);

router.post('/sign-in', artistController.postSignIn);

// User Sign Out
router.get('/sign-out', artistController.signOut);

// Artist Check Account 
router.get('/check-account', artistController.checkAccount);

// Pending List
router.get('/pending-list', verifyArtist, artistController.getPendingList);

// Add Product
router.get('/product-list/add-product', verifyArtist, artistController.getAddProduct);
router.post('/product-list/add-product', verifyArtist, store.product.array('image', 4), artistController.postAddProduct);

// View Pending Product
router.get('/pending-list/:prId/view', verifyArtist, artistController.viewPendingProduct);

// Edit Pending Product
router.get('/pending-list/:prId/edit', verifyArtist, artistController.getEditPendingProduct);
router.post('/pending-list/edit-product', verifyArtist, store.product.array('image', 4), artistController.postEditPendingProduct);

// Delete Pending Product
router.get('/pending-list/:prId/delete', verifyArtist, artistController.deletePendingProduct);

// Product List
router.get('/product-list', verifyArtist, artistController.getProductList)

// View  Product
router.get('/product-list/:prId/view', verifyArtist, artistController.veiwProduct);

// Delete Product
router.get('/product-list/:prId/delete', verifyArtist, artistController.deleteProduct);

// Profile 
router.get('/profile', verifyArtist, artistController.getProfile)

// Edit Profile
router.get('/profile/edit', verifyArtist, artistController.getEditProfile);
router.post('/profile/edit', verifyArtist, store.artist.single('image'), artistController.postEditProfile);


// Chnage Password
router.get('/change-password', verifyArtist, artistController.getChangePassword);
router.post('/change-password', verifyArtist, artistController.postChangePassword)

// Change Email
router.get('/change-email', verifyArtist, artistController.getChangeEmail);
router.post('/change-email', verifyArtist,)



module.exports = router;
