const artistHelper = require('../helpers/artist-helpers');
const optionHelpers = require('../helpers/option-helper');
const adminHelpers = require('../helpers/admin-helpers');
const fs = require('fs');
const path = require('path');
const twilioHelper = require('../helpers/twilio-helper');

module.exports = {
    // Dashboard Start
    getDashboard: async (req, res, next) => {
        let artist = req.session._BR_ARTIST
        try {
            let dashboardCount = await artistHelper.getDashboardDetails(artist.arId)
            res.render('artist/dashboard', { title: 'Dashboard | Bristles', artist, dashboardCount });
        } catch (error) {
            res.render('error/artist-found', { title: 'Dashboard | Bristles', artist });

        }
    },
    getTotalRevenueChart: async (req, res, next) => {
        try {
            let revenue = await artistHelper.getTotalRevenueChart(req.session._BR_ARTIST.arId)
            res.json(revenue)
        } catch (error) {
            next(error)
        }
    },
    top4CategoryChart:async(req,res)=>{
        try {
        
            let categoryChart = await artistHelper.get4TopCategory(req.session._BR_ARTIST.arId)
            res.json(categoryChart)
        } catch (error) {
            next(error)
        }
    },
    // Dashboard End

    // Sign Start
    getSignUp: async (req, res, next) => {
        try {
            if (req.session._BR_ARTIST) {
                res.redirect('/artist')
            } else if (req.session.error) {
                res.render('artist/sign-up', { title: "Sign Up", "error": req.session.error })
                req.session.error = false
            } else {
                res.render('artist/sign-up', { title: "Sign Up" })
            }

        } catch (error) {
            next(error)
        }
    },
    postSignUp: async (req, res, next) => {
        try {
            let response = await artistHelper.verifyEmail(req.body.email)
            if (response.emailError) {
                req.session.error = "Email Id existed"
                res.redirect('/artist/sign-up')
            } else if (response.status) {
                req.session._BR_DATA = req.body
                let status = await twilioHelper.dosms(req.body.mobile)
                if (status) {
                    let mobile = req.body.mobile.substr(req.body.mobile.length - 3);
                    res.render('artist/otp', { title: 'OTP | Bristles', mobile })
                } else {
                    req.session.error = 'Please check Mobile Number'
                    res.redirect('/artist/sign-up')
                }

            }

        } catch (error) {
            next(error)
        }

    },
    postOtp: async (req, res, next) => {
        try {

            let mobile = req.session._BR_DATA.mobile.substr(req.session._BR_DATA.mobile.length - 3);
            await twilioHelper.otpVerify(req.body.otp, req.session._BR_DATA.mobile).then(async (response) => {
                if (response) {
                    let result = await artistHelper.doSignUp(req.session._BR_DATA)
                    req.session._BR_DATA = false
                    req.session._BR_ARTIST_CHECK_ID = result.insertedId
                    req.session._BR_ARTIST_CHECK = true
                    res.redirect('/artist/sign-in')

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
        } catch (error) {
            next(error)
        }
    },
    resendOTP: async (req, res, next) => {
        try {
            let status = await twilioHelper.dosms(req.session._BR_DATA.mobile)
            if (status) {
                res.json(status)
            }

        } catch (error) {
            next(error)
        }

    },
    getSignIn: async (req, res, next) => {
        try {
            if (req.session._BR_ARTIST) {
                res.redirect('/artist')
            } else if (req.session.error) {
                res.render('artist/sign-in', { title: "Sign In", "error": req.session.error })
                req.session.error = false
            } else {
                res.render('artist/sign-in', { title: "Sign In" })
            }

        } catch (error) {
            next(error)
        }
    },
    postSignIn: async (req, res, next) => {
        try {
            let data = await artistHelper.doSignIn(req.body)
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

        } catch (error) {
            next(error)
        }

    },
    getForgotPage: async (req, res, next) => {
        try {
            if (req.session.error) {
                res.render('artist/forgot-password', { title: 'Forgot password | Bristles', 'error': req.session.error })
                req.session.error = false
            } else {
                res.render('artist/forgot-password', { title: 'Forgot password | Bristles' })
            }

        } catch (error) {
            next(error)
        }
    },
    postForgotPassword: async (req, res, next) => {
        try {
            let response = await artistHelper.verifyEmail(req.body.email)
            if (response.data) {
                let status = await twilioHelper.dosms(response.data.mobile)

                if (status) {
                    let mobile = response.data.mobile.substr(response.data.mobile.length - 3);
                    req.session._BR_DATA = response.data
                    res.render('artist/otp', { title: 'OTP | Bristles', mobile, forgot: true })
                }

            } else {
                req.session.error = 'Incorrect Email Address'
                res.redirect('/artist/forgot-password')
            }

        } catch (error) {
            next(error)
        }

    },
    postForgotOtp: async (req, res, next) => {
        try {
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

        } catch (error) {
            next(error)
        }
    },
    setNewPassword: async (req, res, next) => {
        try {
            await artistHelper.setNewPassword(req.body, req.session._BR_DATA.arId)
            req.session._BR_DATA = false
            req.session.success = 'Your Password Changed'
            res.redirect('/artist/sign-in')

        } catch (error) {
            next(error)
        }

    },
    signOut: async (req, res, next) => {
        try {
            req.session._BR_ARTIST = false
            res.redirect('/artist/sign-in')
        } catch (error) {
            next(error)
        }
    },
    checkAccount: async (req, res, next) => {
        try {

            if (req.session._BR_ARTIST_CHECK_ID) {
                let response = await artistHelper.checkAccountActivation(req.session._BR_ARTIST_CHECK_ID)
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

            } else {
                req.session._BR_ARTIST_CHECK_ID = false
                req.session._BR_ARTIST_CHECK = false
                res.redirect('/artist/sign-in')
            }
        } catch (error) {
            next(error)
        }
    },
    // Sign End

    // Profile Start
    getProfile: async (req, res, next) => {
        let artist = req.session._BR_ARTIST
        try {
            let artistData = await artistHelper.getArtist(artist.arId)
            if (req.session.success) {
                res.render('artist/profile', { title: 'Profile | Bristles', artist, artistData, "success": req.session.success })
                req.session.success = false
            } else {
                res.render('artist/profile', { title: 'Profile | Bristles', artist, artistData })
            }

        } catch (error) {
            res.render('error/artist-found', { title: 'Profile | Bristles', artist, })

        }

    },
    getEditProfile: async (req, res, next) => {
        try {
            let artist = req.session._BR_ARTIST
            let artistData = await artistHelper.getArtist(artist.arId)
            res.render('artist/edit-profile', { title: 'Edit profile | Bristles', artist, artistData })

        } catch (error) {
            res.render('error/artist-found', { title: 'Edit profile | Bristles', artist, })

        }

    },
    postEditProfile: async (req, res, next) => {
        try {

            let image = null
            if (req.file) {
                image = req.file.filename
            }
            req.body.image = image
            let obj = await artistHelper.editProfile(req.body)
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
        } catch (error) {
            next(error)
        }

    },
    getChangePassword: async (req, res, next) => {
        let artist = req.session._BR_ARTIST
        try {
            if (req.session.success) {
                res.render('artist/change-password', { title: 'Change Password | Bristles', artist, "success": req.session.success })
                req.session.success = false
            } else if (req.session.error) {
                res.render('artist/change-password', { title: 'Change Password | Bristles', artist, "error": req.session.error })
                req.session.error = false
            } else {
                res.render('artist/change-password', { title: 'Change Password | Bristles', artist })
            }

        } catch (error) {
            res.render('error/artist-found', { title: 'Change Password | Bristles', artist })

        }
    },
    postChangePassword: async (req, res, next) => {
        try {
            let response = await artistHelper.changePassword(req.body)
            if (response.passErr) {
                req.session.error = "Incorrect current password"
                res.redirect('/artist/change-password')
            } else {
                req.session.success = "Password changed"
                res.redirect('/artist/change-password')
            }

        } catch (error) {
            next(error)
        }

    },
    getChangeEmail: async (req, res, next) => {
        let artist = req.session._BR_ARTIST
        try {
            if (req.session.success) {
                res.render('artist/change-email', { title: 'Change Email | Bristles', artist, "success": req.session.success })
                req.session.success = false
            } else if (req.session.error) {
                res.render('artist/change-email', { title: 'Change Email | Bristles', artist, "error": req.session.error })
                req.session.error = false
            } else {
                res.render('artist/change-email', { title: 'Change Email | Bristles', artist })
            }

        } catch (error) {
            res.render('error/artist-found', { title: 'Change Email | Bristles', artist })

        }
    },
    postChangeEmail: async (req, res, next) => {
        try {
            let response = await artistHelper.changeEmail(req.body)
            if (response.emailErr) {
                req.session.error = "This email already used"
                res.redirect('/artist/change-email')
            } else {
                req.session._BR_ARTIST.email = response
                req.session.success = "Email changed"
                res.redirect('/artist/change-email')
            }

        } catch (error) {
            next(error)
        }

    },
    // Profile End

    // Pending Item Start
    getPendingList: async (req, res, next) => {
        let artist = req.session._BR_ARTIST
        try {

            let productList = await artistHelper.getPendingList(artist.arId)
            if (req.session.success) {
                res.render('artist/pending-list', { title: 'Pending List | Bristles', artist, productList, "success": req.session.success })
                req.session.success = false
            } else {
                res.render('artist/pending-list', { title: 'Pending List | Bristles', artist, productList })
            }
        } catch (error) {
            res.render('error/artist-found', { title: 'Pending List | Bristles', artist, })

        }

    },
    getAddProduct: async (req, res, next) => {
        let artist = req.session._BR_ARTIST
        try {
            let category = await adminHelpers.getAllCategory()
            if (req.session.success) {
                res.render('artist/add-product', { title: 'Add Product | Bristles', artist, optionHelpers, category, "success": req.session.success })
                req.session.success = false
            } else {
                res.render('artist/add-product', { title: 'Add Product | Bristles', artist, optionHelpers, category, })
            }

        } catch (error) {

            res.render('error/artist-found', { title: 'Add Product | Bristles', artist, })
        }
    },
    postAddProduct: async (req, res, next) => {
        try {
            let image = []
            for (let i = 0; i < req.files.length; i++) {
                image[i] = req.files[i].filename
            }
            req.body.image = image
            await artistHelper.addProduct(req.body)
            req.session.success = "New product created"
            res.redirect('/artist/product-list/add-product')

        } catch (error) {
            next(error)
        }

    },
    viewPendingProduct: async (req, res, next) => {
        let artist = req.session._BR_ARTIST
        try {
            let prId = req.params.prId
            let product = await artistHelper.getOneProduct(prId)
            res.render('artist/view-pending', { title: 'View Product | Bristles', artist, product, })

        } catch (error) {
            res.render('error/artist-found', { title: 'View Product | Bristles', artist, })

        }

    },
    getEditPendingProduct: async (req, res, next) => {
        let artist = req.session._BR_ARTIST
        try {

            let prId = req.params.prId
            let category = await adminHelpers.getAllCategory()
            let product = await artistHelper.getOneProduct(prId)
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
        } catch (error) {
            res.render('error/artist-found', { title: 'Edit Product | Bristles', artist, })

        }

    },
    postEditPendingProduct: async (req, res, next) => {
        try {

            let image = []
            for (let i = 0; i < req.files.length; i++) {
                image[i] = req.files[i].filename
            }
            req.body.image = image
            let imageArry = await artistHelper.editProduct(req.body)
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
        } catch (error) {
            next(error)
        }

    },
    deletePendingProduct: async (req, res, next) => {
        try {

            let imageArray = await artistHelper.deleteProduct(req.params.prId)
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
        } catch (error) {
            next(error)
        }

    },
    // Pending Item End

    // Prodcut Start
    getProductList: async (req, res, next) => {
        let artist = req.session._BR_ARTIST
        try {
            let productList = await artistHelper.getAllProducts(artist.arId)
            if (req.session.success) {
                res.render('artist/product-list', { title: 'Product List | Bristles', artist, productList, "success": req.session.success })
                req.session.success = false
            } else {
                res.render('artist/product-list', { title: 'Product List | Bristles', artist, productList, })
            }

        } catch (error) {
            res.render('error/artist-found', { title: 'Product List | Bristles', artist, })

        }

    },
    veiwProduct: async (req, res, next) => {
        let artist = req.session._BR_ARTIST
        try {
            let prId = req.params.prId
            let product = await artistHelper.getOneProduct(prId)
            res.render('artist/view-product', { title: 'View Product | Bristles', artist, product, })

        } catch (error) {

            res.render('error/artist-found', { title: 'View Product | Bristles', artist, })
        }

    },
    deleteProduct: async (req, res, next) => {
        try {
            let prId = req.params.prId
            await adminHelpers.deleteProduct(prId)
            req.session.success = "This Product deleted"
            res.redirect('/artist/product-list')

        } catch (error) {
            next(error)
        }

    },
    orderStatus: async (req, res, next) => {
        let artist = req.session._BR_ARTIST
        try {

            let prId = req.params.prId
            let product = await artistHelper.getOrderStatus(prId)
            res.render('artist/view-order-status', { title: 'Order Status | Bristles', artist, product })
        } catch (error) {
            res.render('error/artist-found', { title: 'Order Status | Bristles', artist, })

        }

    }
    // Prodcut End


}