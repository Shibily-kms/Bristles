const userHelper = require('../helpers/user-helpres')
const adminHelpers = require('../helpers/admin-helpers');
const fs = require('fs');
const path = require('path');
const optionHelper = require('../helpers/option-helper');
const { resolve } = require('path');
const { response } = require('express');

module.exports = {

    // Home Page Start
    getHomePage: async (req, res) => {
        let user = req.session._BR_USER
        let category = await adminHelpers.getAllCategory()
        let latestProducts = await userHelper.getLatestProducts()
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
        userHelper.doSignUp(req.body).then((response) => {
            if (response.emailError) {
                req.session.error = "Email Id existed"
                res.redirect('/sign-up')
            } else if (response) {
                res.redirect('/sign-in')
            }
        })
    },
    getSignIn: (req, res) => {
        if (req.session._BR_USER) {
            res.redirect('/')
        } else if (req.session.error) {
            res.render('user/sign-in', { title: "Sign In", "error": req.session.error })
            req.session.error = false
        } else {
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
                    userHelper.checkGuestCast(data.urId, req.session._BR_TOKEN).then(() => {
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
    signOut: (req, res) => {
        req.session._BR_USER = false
        res.redirect('/sign-in')
    },
    // Sign End

    // Product Start
    getProductCategoryList: (req, res) => {
        let user = req.session._BR_USER
        let NOW_CAT = req.params.NOW_CAT
        adminHelpers.getAllCatProduct(NOW_CAT).then((product) => {
            res.render('user/product-list', { title: NOW_CAT + ' | Bristles', product, NOW_CAT, user })
        })
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
    getAllProdutInSearch: (req, res) => {
        userHelper.getAllProduct().then((product) => {
            res.json(product)
        })
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
        console.log('iam coming');
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
        } else {
            result = await userHelper.getCartCount(req.session._BR_USER.urId)
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
    // CheckOut End

    // Order Start
    postOrder: (req, res) => {
        let user = req.session._BR_USER
        userHelper.orderAccessing(req.body, user.urId).then((response) => {
            console.log(response,'response');
            if (response.methord == "COD") {
                userHelper.afterOreder(response,user.urId,req.body.cpCod).then((urId) => {
                    res.json(urId)
                })
            } else if (response.methord == 'online') {
                console.log('online payment');
            }
        })
    },
    successOrder: (req, res) => {
        let user = req.session._BR_USER
        res.render('user/success-order', { title: 'Order Success | Bristles', user, })
    }
    // Order End


}