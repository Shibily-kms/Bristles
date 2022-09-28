const artistHelper = require('../helpers/artist-helpers');
const optionHelpers = require('../helpers/option-helper');
const adminHelpers = require('../helpers/admin-helpers');
const fs = require('fs');
const path = require('path');
const twilioHelper = require('../helpers/twilio-helper');

module.exports = {
    // OverView Start
    getOverView: (req, res) => {
        let artist = req.session._BR_ARTIST
        res.render('artist/overview', { title: 'Overview | Bristles', artist });
    },
    // OverView End

    // Sign Start
    getSignUp: (req, res) => {
        if (req.session._BR_ARTIST) {
            res.redirect('/artist')
        } else if (req.session.error) {
            res.render('artist/sign-up', { title: "Sign Up", "error": req.session.error })
            req.session.error = false
        } else {
            res.render('artist/sign-up', { title: "Sign Up" })
        }
    },
    postSignUp: (req, res) => {
        console.log('1');
        artistHelper.verifyEmail(req.body.email).then((response) => {
            if (response.emailError) {
                req.session.error = "Email Id existed"
                res.redirect('/artist/sign-up')
            } else if (response.status) {
                req.session._BR_DATA = req.body
                twilioHelper.dosms(req.body.mobile).then((status) => {
                    if (status) {
                        console.log('2');
                        let mobile = req.body.mobile.substr(req.body.mobile.length - 3);
                        res.render('artist/otp', { title: 'OTP | Bristles', mobile })
                    } else {
                        req.session.error = 'Please check Mobile Number'
                        res.redirect('/artist/sign-up')
                    }
                })
            }
        })
        // artistHelper.doSignUp(req.body).then((response) => {
        //     if (response.emailError) {
        //         req.session.error = "Email Id existed"
        //         res.redirect('/artist/sign-up')
        //     } else if (response) {

        //         req.session._BR_ARTIST_CHECK_ID = response.insertedId
        //         req.session._BR_ARTIST_CHECK = true
        //         res.redirect('/artist/sign-in')
        //     }
        // })
    },
    postOtp: (req, res) => {
        console.log('3');
        let mobile = req.session._BR_DATA.mobile.substr(req.session._BR_DATA.mobile.length - 3);
        twilioHelper.otpVerify(req.body.otp, req.session._BR_DATA.mobile).then((response) => {
            if (response) {
                console.log('4');
                artistHelper.doSignUp(req.session._BR_DATA).then((result) => {
                    req.session._BR_DATA = false
                    req.session._BR_ARTIST_CHECK_ID = result.insertedId
                    req.session._BR_ARTIST_CHECK = true
                    console.log('7');
                    res.redirect('/artist/sign-in')
                })
            } else {
                req.session.error = 'Incorrect OTP'
                res.render('artist/otp', { title: 'OTP | Bristles', mobile, 'error': req.session.error })
                req.session.error = false
            }
        }).catch((err) => {
            req.session.error = 'Incorrect OTP'
            res.render('artist/otp', { title: 'OTP | Bristles', mobile, 'error': req.session.error })
            res.session.error = false
        })
    },
    resendOTP: (req, res) => {
        twilioHelper.dosms(req.session._BR_DATA.mobile).then((status) => {
            if (status) {
                res.json(status)
            }
        })
    },
    getSignIn: (req, res) => {
        if (req.session._BR_ARTIST) {
            res.redirect('/artist')
        } else if (req.session.error) {
            res.render('artist/sign-in', { title: "Sign In", "error": req.session.error })
            req.session.error = false
        } else {
            res.render('artist/sign-in', { title: "Sign In" })
        }
    },
    postSignIn: (req, res) => {
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
    },
    getForgotPage: (req, res) => {
        if (req.session.error) {
            res.render('artist/forgot-password', { title: 'Forgot password | Bristles', 'error': req.session.error })
            req.session.error = false
        } else {
            res.render('artist/forgot-password', { title: 'Forgot password | Bristles' })
        }
    },
    postForgotPassword: (req, res) => {
        artistHelper.verifyEmail(req.body.email).then((response) => {
            if (response.data) {
                console.log(response);
                twilioHelper.dosms(response.data.mobile).then((status) => { 
                    
                    if (status) {
                        let mobile = response.data.mobile.substr(response.data.mobile.length - 3);
                        req.session._BR_DATA = response.data
                        console.log(req.body._BR_DATA);
                        res.render('artist/otp', { title: 'OTP | Bristles', mobile, forgot: true })
                    }
                })
            } else {
                req.session.error = 'Incorrect Email Address'
                res.redirect('/artist/forgot-password')
            }
        })
    },
    postForgotOtp: (req, res) => {
        let mobile = req.session._BR_DATA.mobile.substr(req.session._BR_DATA.mobile.length - 3);
        twilioHelper.otpVerify(req.body.otp, req.session._BR_DATA.mobile).then((response) => {
            if (response) {
                res.render('artist/new-password', { title: 'New Passoerd | Bristles', })
            } else {
                req.session.error = 'Incorrect OTP'
                res.render('artist/otp', { title: 'OTP | Bristles', mobile, 'error': req.session.error, forgot: true })
                req.session.error = false
            }
        }).catch((err) => {    
            req.session.error = 'Incorrect OTP' 
            res.render('artist/otp', { title: 'OTP | Bristles', mobile, 'error': req.session.error, forgot: true })
            res.session.error = false
        })
    },
    setNewPassword:(req,res)=>{
        artistHelper.setNewPassword(req.body,req.session._BR_DATA.arId).then(()=>{
            req.session._BR_DATA = false
            req.session.success = 'Your Password Changed'
            res.redirect('/artist/sign-in')
        })
    },
    signOut: (req, res) => {
        req.session._BR_ARTIST = false
        res.redirect('/artist/sign-in')
    },
    checkAccount: (req, res) => {
        if (req.session._BR_ARTIST_CHECK_ID) {
            artistHelper.checkAccountActivation(req.session._BR_ARTIST_CHECK_ID).then((response) => {
                console.log(response);
                if (response.Rejected) {
                    req.session._BR_ARTIST_CHECK = false
                    res.render('artist/check-account', { title: "Place wait...", rejected: true })
                } else if (response.Active) {
                    req.session._BR_ARTIST_CHECK_ID = false
                    req.session._BR_ARTIST_CHECK = false
                    res.redirect('/artist/sign-in')
                } else {
                    res.render('artist/check-account', { title: "Place wait..." })
                }
            })
        } else {
            req.session._BR_ARTIST_CHECK_ID = false
            req.session._BR_ARTIST_CHECK = false
            res.redirect('/artist/sign-in')
        }
    },
    // Sign End

    // Profile Start
    getProfile: (req, res) => {
        let artist = req.session._BR_ARTIST
        artistHelper.getArtist(artist.arId).then((artistData) => {
            if (req.session.success) {
                res.render('artist/profile', { title: 'Profile | Bristles', artist, artistData, "success": req.session.success })
                req.session.success = false
            } else {
                res.render('artist/profile', { title: 'Profile | Bristles', artist, artistData })
            }
        })
    },
    getEditProfile: (req, res) => {
        let artist = req.session._BR_ARTIST
        artistHelper.getArtist(artist.arId).then((artistData) => {
            res.render('artist/edit-profile', { title: 'Edit profile | Bristles', artist, artistData })
        })
    },
    postEditProfile: (req, res) => {
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
    },
    getChangePassword: (req, res) => {
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
    },
    postChangePassword: (req, res) => {
        artistHelper.changePassword(req.body).then((response) => {
            if (response.passErr) {
                req.session.error = "Incorrect current password"
                res.redirect('/artist/change-password')
            } else {
                req.session.success = "Password changed"
                res.redirect('/artist/change-password')
            }
        })
    },
    getChangeEmail: (req, res) => {
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
    },
    postChangeEmail: (req, res) => {
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
    },
    // Profile End

    // Pending Item Start
    getPendingList: (req, res) => {
        let artist = req.session._BR_ARTIST
        artistHelper.getPendingList(artist.arId).then((productList) => {
            if (req.session.success) {
                res.render('artist/pending-list', { title: 'Pending List | Bristles', artist, productList, "success": req.session.success })
                req.session.success = false
            } else {
                res.render('artist/pending-list', { title: 'Pending List | Bristles', artist, productList })
            }
        })
    },
    getAddProduct: async (req, res) => {
        let artist = req.session._BR_ARTIST
        let category = await adminHelpers.getAllCategory()
        if (req.session.success) {
            res.render('artist/add-product', { title: 'Add Product | Bristles', artist, optionHelpers, category, "success": req.session.success })
            req.session.success = false
        } else {
            res.render('artist/add-product', { title: 'Add Product | Bristles', artist, optionHelpers, category, })
        }
    },
    postAddProduct: (req, res) => {
        let image = []
        for (let i = 0; i < req.files.length; i++) {
            image[i] = req.files[i].filename
        }
        req.body.image = image
        artistHelper.addProduct(req.body).then(() => {
            req.session.success = "New product created"
            res.redirect('/artist/product-list/add-product')
        })
    },
    viewPendingProduct: (req, res) => {
        let prId = req.params.prId
        let artist = req.session._BR_ARTIST
        artistHelper.getOneProduct(prId).then((product) => {
            res.render('artist/view-pending', { title: 'View Product | Bristles', artist, product, })
        })
    },
    getEditPendingProduct: async (req, res) => {
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
    },
    postEditPendingProduct: (req, res) => {
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
    },
    deletePendingProduct: (req, res) => {
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
    },
    // Pending Item End

    // Prodcut Start
    getProductList: (req, res) => {
        let artist = req.session._BR_ARTIST
        artistHelper.getAllProducts(artist.arId).then((productList) => {
            if (req.session.success) {
                res.render('artist/product-list', { title: 'Product List | Bristles', artist, productList, "success": req.session.success })
                req.session.success = false
            } else {
                res.render('artist/product-list', { title: 'Product List | Bristles', artist, productList, })
            }
        })
    },
    veiwProduct: (req, res) => {
        let prId = req.params.prId
        let artist = req.session._BR_ARTIST
        artistHelper.getOneProduct(prId).then((product) => {
            res.render('artist/view-product', { title: 'View Product | Bristles', artist, product, })
        })
    },
    deleteProduct: (req, res) => {
        let prId = req.params.prId
        adminHelpers.deleteProduct(prId).then(() => {
            req.session.success = "This Product deleted"
            res.redirect('/artist/product-list')
        })
    },
    orderStatus: (req, res) => {
        let prId = req.params.prId
        let artist = req.session._BR_ARTIST
        artistHelper.getOrderStatus(prId).then((product) => {
            console.log(product);
            res.render('artist/view-order-status', { title: 'Order Status | Bristles', artist, product })
        })
    }
    // Prodcut End


}