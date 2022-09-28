const userHelper = require('../helpers/user-helpres')
const adminHelpers = require('../helpers/admin-helpers');
const fs = require('fs');
const path = require('path');
const optionHelper = require('../helpers/option-helper');
const twilioHelper = require('../helpers/twilio-helper');



module.exports = {

    // Home Page Start
    getHomePage: async (req, res) => {
        let user = req.session._BR_USER
        let category = await adminHelpers.getAllCategory()
        let latestProducts = user ? await userHelper.getLatestProducts(user.urId) : await userHelper.getLatestProducts()
        let carousel = await adminHelpers.getCarousel()

        res.render('user/home', { title: 'Home | Bristles', category, user, latestProducts, carousel });
    },
    // Home Page End

    // Sign Start
    getSignUp: (req, res) => {
        if (req.session._BR_USER) {
            res.redirect('/')
        } else if (req.session.error) {
            res.render('user/sign-up', { title: "Sign Up", "error": req.session.error })
            req.session.error = false
        } else {
            res.render('user/sign-up', { title: "Sign Up" })
        }
    },
    postSignUp: (req, res) => {
        userHelper.verifyEmail(req.body.email).then((response) => {
            console.log(response);
            if (response.emailError) {
                req.session.error = "Email Id existed"
                res.redirect('/sign-up')
            } else if (response.status) {
                req.session._BR_DATA = req.body
                twilioHelper.dosms(req.body.mobile).then((status) => {
                    if (status) {
                        let mobile = req.body.mobile.substr(req.body.mobile.length - 3);
                        res.render('user/otp', { title: 'OTP | Bristles', mobile })
                    } else {
                        req.session.error = 'Please check Mobile Number'
                        res.redirect('/sign-up')
                    }
                })
            }
        })
    },

    postOtp: (req, res) => {
        let mobile = req.session._BR_DATA.mobile.substr(req.session._BR_DATA.mobile.length - 3);
        twilioHelper.otpVerify(req.body.otp, req.session._BR_DATA.mobile).then((response) => {
            if (response) {
                userHelper.doSignUp(req.session._BR_DATA).then((result) => {
                    req.session._BR_DATA = false
                    res.redirect('/sign-in')
                })
            } else {
                req.session.error = 'Incorrect OTP'
                res.render('user/otp', { title: 'OTP | Bristles', mobile, 'error': req.session.error })
                req.session.error = false
            }
        }).catch((err) => {
            req.session.error = 'Incorrect OTP'
            res.render('user/otp', { title: 'OTP | Bristles', mobile, 'error': req.session.error })
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
        console.log('8');
        if (req.session._BR_USER) {
            console.log('9');
            res.redirect('/')
        } else if (req.session.error) {
            res.render('user/sign-in', { title: "Sign In", "error": req.session.error })
            req.session.error = false
        } else if (req.session.success) {
            res.render('user/sign-in', { title: "Sign In", "success": req.session.success })
            req.session.success = false
        } else {
            console.log('10');
            res.render('user/sign-in', { title: "Sign In" })
        }
    },
    postSignIn: (req, res) => {
        userHelper.doSignIn(req.body).then((data) => {
            if (data.emailError) {
                req.session.error = "Invalid email id"
                res.redirect('/sign-in')
            } else if (data.passError) {
                req.session.error = "Incorrect password"
                res.redirect('/sign-in')
            } else if (data) {
                if (req.session._BR_TOKEN) {
                    userHelper.checkGuestCart(data.urId, req.session._BR_TOKEN).then(() => {
                        req.session._BR_TOKEN = false
                        req.session._BR_USER = data
                        res.redirect('/');
                    })
                } else {
                    req.session._BR_USER = data
                    res.redirect('/');
                }
            }
        })
    },
    getForgotPage: (req, res) => {
        if (req.session.error) {
            res.render('user/forgot-password', { title: 'Forgot password | Bristles', 'error': req.session.error })
            req.session.error = false
        } else {
            res.render('user/forgot-password', { title: 'Forgot password | Bristles' })
        }
    },
    postForgotPassword: (req, res) => {
        userHelper.verifyEmail(req.body.email).then((response) => {
            if (response.data) {
                console.log(response);
                twilioHelper.dosms(response.data.mobile).then((status) => { 
                    
                    if (status) {
                        let mobile = response.data.mobile.substr(response.data.mobile.length - 3);
                        req.session._BR_DATA = response.data
                        console.log(req.body._BR_DATA);
                        res.render('user/otp', { title: 'OTP | Bristles', mobile, forgot: true })
                    }
                })
            } else {
                req.session.error = 'Incorrect Email Address'
                res.redirect('/forgot-password')
            }
        })
    },
    postForgotOtp: (req, res) => {
        let mobile = req.session._BR_DATA.mobile.substr(req.session._BR_DATA.mobile.length - 3);
        twilioHelper.otpVerify(req.body.otp, req.session._BR_DATA.mobile).then((response) => {
            if (response) {
                res.render('user/new-password', { title: 'New Passoerd | Bristles', })
            } else {
                req.session.error = 'Incorrect OTP'
                res.render('user/otp', { title: 'OTP | Bristles', mobile, 'error': req.session.error, forgot: true })
                req.session.error = false
            }
        }).catch((err) => {    
            req.session.error = 'Incorrect OTP' 
            res.render('user/otp', { title: 'OTP | Bristles', mobile, 'error': req.session.error, forgot: true })
            res.session.error = false
        })
    },
    setNewPassword:(req,res)=>{
        userHelper.setNewPassword(req.body,req.session._BR_DATA.urId).then(()=>{
            req.session._BR_DATA = false
            req.session.success = 'Your Password Changed'
            res.redirect('/sign-in')
        })
    },
    signOut: (req, res) => {
        req.session._BR_USER = false
        res.redirect('/sign-in')
    },
    // Sign End

    // Product Start
    getProductCategoryList: async (req, res) => {
        let user = req.session._BR_USER
        let NOW_CAT = req.params.NOW_CAT
        let product = user ? await userHelper.getAllCatProduct(NOW_CAT, user.urId) : await userHelper.getAllCatProduct(NOW_CAT)
        res.render('user/product-list', { title: NOW_CAT + ' | Bristles', product, NOW_CAT, user })

    },
    viewProduct: (req, res) => {
        let user = req.session._BR_USER
        let NOW_CAT = req.params.NOW_CAT
        let prId = req.params.prId
        adminHelpers.getOneProduct(prId).then((product) => {
            res.render('user/view-product', { title: 'View Product | Bristles', product, NOW_CAT, user })
        })

    },
    addToCart: async (req, res) => {
        let result = null
        if (req.session._BR_TOKEN) {
            result = await userHelper.addToCart(req.session._BR_TOKEN, req.body)
        } else {
            result = await userHelper.addToCart(req.session._BR_USER.urId, req.body)
        }
        res.json(result)
    },
    // Product End

    // Search Start
    getSearchPage: async (req, res) => {
        let user = req.session._BR_USER
        let categoryList = await adminHelpers.getAllCategory()
        let optionList = optionHelper
        res.render('user/search', { title: 'Search | Bristles', toggleIcon: true, categoryList, optionList, user })
    },
    getAllProdutInSearch: async (req, res) => {
        let user = req.session._BR_USER
        let product = user ? await userHelper.getAllProduct(user.urId) : await userHelper.getAllProduct()
        res.json(product)
    },
    // Search End

    // Profile Start
    getProfile: (req, res) => {
        let user = req.session._BR_USER
        userHelper.getUser(user.urId).then((userData) => {
            if (req.session.success) {
                res.render('user/profile', { title: 'Profile | Bristles', user, userData, "success": req.session.success })
                req.session.success = false
            } else {
                res.render('user/profile', { title: 'Profile | Bristles', user, userData })
            }
        })
    },
    getEditProfile: (req, res) => {
        let user = req.session._BR_USER
        userHelper.getUser(user.urId).then((userData) => {
            res.render('user/edit-profile', { title: 'Edit profile | Bristles', user, userData })
        })
    },
    postEditProfile: (req, res) => {

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
    },
    getChangePassword: (req, res) => {
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
    },
    postChangePassword: (req, res) => {

        userHelper.changePassword(req.body).then((response) => {
            if (response.passErr) {
                req.session.error = "Incorrect current password"
                res.redirect('/profile/change-password')
            } else {
                req.session.success = "Password changed"
                res.redirect('/profile/change-password')
            }
        })
    },
    getChangeEmail: (req, res) => {
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
    },
    postChangeEmail: (req, res) => {
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
    },
    getAlladdress: (req, res) => {
        let user = req.session._BR_USER
        userHelper.getAlladdress(user.urId).then((address) => {
            if (req.session.success) {
                res.render('user/address', { title: 'Mangae Address | Bristles', user, address, 'success': req.session.success })
                req.session.success = false
            } else {
                res.render('user/address', { title: 'Mangae Address | Bristles', user, address })
            }
        })
    },
    postAddAddress: (req, res) => {
        userHelper.addNewAddress(req.body, req.session._BR_USER.urId).then(() => {
            res.redirect('/address')
        })
    },
    postEditAddress: (req, res) => {
        let adId = req.params.adId
        let user = req.session._BR_USER
        userHelper.updateAddress(req.body, adId, user.urId).then((response) => {
            // req.session.success = "Address updated"
            res.json(response)
        })
    },
    deleteAddress: (req, res) => {
        let user = req.session._BR_USER
        userHelper.deleteAddress(req.body.adId, user.urId).then((response) => {
            // req.session.success = "Address Deleted"
            res.json(response)
        })
    },
    // Profile End

    // Cart Start
    getCartCount: async (req, res) => {
        let result = null
        if (req.session._BR_TOKEN) {
            result = await userHelper.getCartCount(req.session._BR_TOKEN)
        } else if (req.session._BR_USER) {
            result = await userHelper.getCartCount(req.session._BR_USER.urId)
        } else {
            result = 0
        }
        res.json(result)
    },

    getCart: async (req, res) => {
        let urId = null
        let user = req.session._BR_USER
        if (req.session._BR_TOKEN) {
            urId = req.session._BR_TOKEN
        } else if (user) {
            urId = user.urId
        }
        let products = await userHelper.getCartProduct(urId)
        let total = 0
        let discount = 0
        for (let i = 0; i < products.length; i++) {
            total = total + Number(products[i].cartItems.price)
        }
        for (let i = 0; i < products.length; i++) {
            if (products[i].cartItems.ogPrice) {
                discount = discount + (Number(products[i].cartItems.ogPrice) - Number(products[i].cartItems.price))
            }
        }
        if (req.session.success) {
            res.render('user/cart', { title: 'Cart | Bristles', user, products, total, discount, "success": req.session.success })
            req.session.success = false
        } else {
            res.render('user/cart', { title: 'Cart | Bristles', user, products, total, discount })
        }
    },

    removeFromCart: (req, res) => {
        let urId = null
        let user = req.session._BR_USER
        if (req.session._BR_TOKEN) {
            urId = req.session._BR_TOKEN
        } else if (user) {
            urId = user.urId
        }
        userHelper.removeProductFromCart(req.body.prId, urId).then((result) => {
            req.session.success = "Removed form Cart"
            res.json(result)
        })
    },
    // Cart End

    // CheckOut Start
    getCheckOut: async (req, res) => {
        let user = req.session._BR_USER
        let products = await userHelper.getCartProduct(user.urId)
        let address = await userHelper.getAlladdress(user.urId)
        let total = 0
        let discount = 0
        for (let i = 0; i < products.length; i++) {
            total = total + Number(products[i].cartItems.price)
        }
        for (let i = 0; i < products.length; i++) {
            if (products[i].cartItems.ogPrice) {
                discount = discount + (Number(products[i].cartItems.ogPrice) - Number(products[i].cartItems.price))
            }
        }
        res.render('user/checkout', { title: 'Checkout | Bristles', user, products, total, discount, address })

    },
    changeCurrentAddress: (req, res) => {
        userHelper.changeCurrentAddress(req.body.adId, req.session._BR_USER.urId).then((response) => {
            res.json(response)
        })
    },
    checkCouponCode: (req, res) => {
        userHelper.checkCouponCode(req.body).then((response) => {
            res.json(response)
        })
    },
    verifyPayment: (req, res) => {
        userHelper.verifyPayment(req.body).then(() => {
            userHelper.changePaymentStatus(req.body).then(() => {

                userHelper.savePaymentDetails(req.body).then(() => {
                    res.json({ status: true })
                })

            })
        }).catch((err) => {
            res.json({ status: false, errMag: err })
        })
    },
    // CheckOut End

    // Order Start
    postOrder: (req, res) => {
        let user = req.session._BR_USER

        userHelper.orderAccessing(req.body, user.urId).then(async (response) => {
            if (response.methord == "COD") {
                userHelper.afterOreder(response.products, user.urId, req.body.cpCode).then(() => {
                    res.json({ codSuccess: true })
                })
            } else if (response.methord == 'online') {
                await userHelper.afterOreder(response.products, user.urId, req.body.cpCode)
                await userHelper.generateRazorpay(response.orId, response.amount).then((generateResponse) => {
                    generateResponse.name = response.name
                    generateResponse.email = user.email
                    generateResponse.phone = response.phone
                    generateResponse.urId = user.urId
                    res.json(generateResponse)
                })
            }
        })
    },
    successOrder: (req, res) => {
        let user = req.session._BR_USER
        res.render('user/success-order', { title: 'Order Success | Bristles', user, })
    },
    failedOrder: (req, res) => {
        let user = req.session._BR_USER
        let reason = null
        res.render('user/payment-failed', { title: 'Order Success | Bristles', user, reason })
    },
    getOrder: (req, res) => {
        let user = req.session._BR_USER
        userHelper.getAllOrder(user.urId).then((order) => {

            res.render('user/order-list', { title: 'Order List | Bristles', user, order })
        })
    },
    getOneOrder: (req, res) => {
        let orId = req.query.orId
        let urId = req.query.urId
        let prId = req.query.prId
        let user = req.session._BR_USER
        userHelper.getOneOrder(urId, orId, prId).then((order) => {
            res.render('user/view-one-order', { title: 'View Order | Bristles', user, order })
        })
    },
    getCancelOrder: (req, res) => {
        let orId = req.body.orId
        userHelper.cancelOrder(orId).then((response) => {
            res.json(response)
        })
    },
    pendingPaymentCall: (req, res) => {
        let user = req.session._BR_USER
        userHelper.generateRazorpay(req.body.orId, req.body.amount).then((generateResponse) => {
            generateResponse.name = req.body.name
            generateResponse.email = user.email
            generateResponse.phone = req.body.phone
            generateResponse.urId = user.urId
            res.json(generateResponse)
        })
    },
    // Order End

    // Wish Start
    wishProduct: (req, res) => {
        let user = req.session._BR_USER
        if (user) {
            userHelper.wishProduct(req.body.prId, user.urId).then((response) => {
                res.json(response)
            })
        } else {
            response.nullUser = true
            res.json(response)
        }
    },
    getAllWishlist: (req, res) => {
        let user = req.session._BR_USER
        userHelper.getAllWishlist(user.urId).then((wishlist) => {
            res.render('user/wishlist', { title: 'Wishlist | Bristles', user, wishlist })
        })
    }
    // Wish End


}