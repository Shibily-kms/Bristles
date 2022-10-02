const userHelper = require('../helpers/user-helpres')
const adminHelpers = require('../helpers/admin-helpers');
const fs = require('fs');
const path = require('path');
const optionHelper = require('../helpers/option-helper');
const twilioHelper = require('../helpers/twilio-helper');
var json2xls = require('json2xls');


module.exports = {

    // Home Page Start
    getHomePage: async (req, res, next) => {
        let user = req.session._BR_USER
        try {
            let category = await adminHelpers.getAllCategory()
            let latestProducts = user ? await userHelper.getLatestProducts(user.urId) : await userHelper.getLatestProducts()
            let carousel = await adminHelpers.getCarousel()
            res.render('user/home', { title: 'Home | Bristles', category, user, latestProducts, carousel });

        } catch (error) {
            res.render('error/user-found', { title: 'Home | Bristles', user, });

        }
    },
    // Home Page End

    // Sign Start
    getSignUp: async (req, res, next) => {
        try {
            if (req.session._BR_USER) {
                res.redirect('/')
            } else if (req.session.error) {
                res.render('user/sign-up', { title: "Sign Up", "error": req.session.error })
                req.session.error = false
            } else {
                res.render('user/sign-up', { title: "Sign Up" })
            }

        } catch (error) {
            next(error)
        }
    },
    postSignUp: async (req, res, next) => {
        try {

            let response = await userHelper.verifyEmail(req.body.email)
            if (response.emailError) {
                req.session.error = "Email Id existed"
                res.redirect('/sign-up')
            } else if (response.status) {
                console.log('here');
                req.session._BR_DATA = req.body
                await twilioHelper.dosms(req.body.mobile).then((status) => {
                    if (status) {
                        let mobile = req.body.mobile.substr(req.body.mobile.length - 3);
                        res.render('user/otp', { title: 'OTP | Bristles', mobile })
                    } else {
                        req.session.error = 'Please check Mobile Number'
                        res.redirect('/sign-up')
                    }
                }).catch((err) => {
                    res.redirect('/sign-up')
                })
            }
        } catch (error) {
            next(error)
        }

    },

    postOtp: async (req, res, next) => {
        try {
            let mobile = req.session._BR_DATA.mobile.substr(req.session._BR_DATA.mobile.length - 3);
            twilioHelper.otpVerify(req.body.otp, req.session._BR_DATA.mobile).then(async (response) => {
                if (response) {
                    await userHelper.doSignUp(req.session._BR_DATA)
                    req.session._BR_DATA = false
                    res.redirect('/sign-in')

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

            if (req.session._BR_USER) {
                res.redirect('/')
            } else if (req.session.error) {
                res.render('user/sign-in', { title: "Sign In", "error": req.session.error })
                req.session.error = false
            } else if (req.session.success) {
                res.render('user/sign-in', { title: "Sign In", "success": req.session.success })
                req.session.success = false
            } else {
                res.render('user/sign-in', { title: "Sign In" })
            }
        } catch (error) {
            next(error)
        }
    },
    postSignIn: async (req, res, next) => {
        try {

            let data = await userHelper.doSignIn(req.body)
            if (data.emailError) {
                req.session.error = "Invalid email id"
                res.redirect('/sign-in')
            } else if (data.passError) {
                req.session.error = "Incorrect password"
                res.redirect('/sign-in')
            } else if (data) {
                if (req.session._BR_TOKEN) {
                    await userHelper.checkGuestCart(data.urId, req.session._BR_TOKEN)
                    req.session._BR_TOKEN = false
                    req.session._BR_USER = data
                    res.redirect('/');

                } else {
                    req.session._BR_USER = data
                    res.redirect('/');
                }
            }
        } catch (error) {
            next(error)
        }

    },
    getForgotPage: async (req, res, next) => {
        try {
            if (req.session.error) {
                res.render('user/forgot-password', { title: 'Forgot password | Bristles', 'error': req.session.error })
                req.session.error = false
            } else {
                res.render('user/forgot-password', { title: 'Forgot password | Bristles' })
            }

        } catch (error) {
            next(error)
        }
    },
    postForgotPassword: async (req, res, next) => {
        try {
            let response = await userHelper.verifyEmail(req.body.email)
            if (response.data) {
                let status = await twilioHelper.dosms(response.data.mobile)

                if (status) {
                    let mobile = response.data.mobile.substr(response.data.mobile.length - 3);
                    req.session._BR_DATA = response.data
                    res.render('user/otp', { title: 'OTP | Bristles', mobile, forgot: true })
                }

            } else {
                req.session.error = 'Incorrect Email Address'
                res.redirect('/forgot-password')
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

        } catch (error) {
            next(error)
        }
    },
    setNewPassword: async (req, res, next) => {
        try {
            userHelper.setNewPassword(req.body, req.session._BR_DATA.urId)
            req.session._BR_DATA = false
            req.session.success = 'Your Password Changed'
            res.redirect('/sign-in')

        } catch (error) {
            next(error)
        }

    },
    signOut: async (req, res, next) => {
        try {
            req.session._BR_USER = false
            res.redirect('/sign-in')

        } catch (error) {
            next(error)
        }
    },
    // Sign End

    // Product Start
    getProductCategoryList: async (req, res, next) => {
        let user = req.session._BR_USER
        try {
            let NOW_CAT = req.params.NOW_CAT
            let product = user ? await userHelper.getAllCatProduct(NOW_CAT, user.urId) : await userHelper.getAllCatProduct(NOW_CAT)
            res.render('user/product-list', { title: NOW_CAT + ' | Bristles', product, NOW_CAT, user })

        } catch (error) {
            res.render('error/user-found', { title: NOW_CAT + ' | Bristles', user })
        }

    },
    viewProduct: async (req, res, next) => {
        let user = req.session._BR_USER
        try {
            let NOW_CAT = req.params.NOW_CAT
            let prId = req.params.prId
            let product = await adminHelpers.getOneProduct(prId)
            res.render('user/view-product', { title: 'View Product | Bristles', product, NOW_CAT, user })

        } catch (error) {

            res.render('error/user-found', { title: 'View Product | Bristles', user })
        }


    },
    addToCart: async (req, res, next) => {
        try {
            let result = null
            if (req.session._BR_TOKEN) {
                result = await userHelper.addToCart(req.session._BR_TOKEN, req.body)
            } else {
                result = await userHelper.addToCart(req.session._BR_USER.urId, req.body)
            }
            res.json(result)

        } catch (error) {
            next(error)
        }
    },
    // Product End

    // Search Start
    getSearchPage: async (req, res, next) => {
        let user = req.session._BR_USER
        try {
            let categoryList = await adminHelpers.getAllCategory()
            let optionList = optionHelper
            res.render('user/search', { title: 'Search | Bristles', toggleIcon: true, categoryList, optionList, user })

        } catch (error) {
            res.render('error/user-found', { title: 'Search | Bristles', toggleIcon: true, user })

        }
    },
    getAllProdutInSearch: async (req, res, next) => {
        let user = req.session._BR_USER
        try {
            let product = user ? await userHelper.getAllProduct(user.urId) : await userHelper.getAllProduct()
            res.json(product)

        } catch (error) {
            next(error)
        }
    },
    // Search End

    // Profile Start
    getProfile: async (req, res, next) => {
        let user = req.session._BR_USER
        try {
            let userData = await userHelper.getUser(user.urId)
            if (req.session.success) {
                res.render('user/profile', { title: 'Profile | Bristles', user, userData, "success": req.session.success })
                req.session.success = false
            } else {
                res.render('user/profile', { title: 'Profile | Bristles', user, userData })
            }

        } catch (error) {
            res.render('error/user-found', { title: 'Profile | Bristles', user, })

        }

    },
    getEditProfile: async (req, res, next) => {
        let user = req.session._BR_USER
        try {
            let userData = await userHelper.getUser(user.urId)
            res.render('user/edit-profile', { title: 'Edit profile | Bristles', user, userData })

        } catch (error) {

            res.render('error/user-found', { title: 'Edit profile | Bristles', user, })
        }

    },
    postEditProfile: async (req, res, next) => {
        try {

            let image = null
            if (req.file) {
                image = req.file.filename
            }
            req.body.image = image
            let obj = await userHelper.editProfile(req.body)
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
        } catch (error) {
            next(error)
        }

    },
    getChangePassword: async (req, res, next) => {
        let user = req.session._BR_USER
        try {
            if (req.session.success) {
                res.render('user/change-password', { title: 'Change Password | Bristles', user, "success": req.session.success })
                req.session.success = false
            } else if (req.session.error) {
                res.render('user/change-password', { title: 'Change Password | Bristles', user, "error": req.session.error })
                req.session.error = false
            } else {
                res.render('user/change-password', { title: 'Change Password | Bristles', user })
            }

        } catch (error) {
            res.render('error/user-found', { title: 'Change Password | Bristles', user })

        }
    },
    postChangePassword: async (req, res, next) => {
        try {

            let response = await userHelper.changePassword(req.body)
            if (response.passErr) {
                req.session.error = "Incorrect current password"
                res.redirect('/profile/change-password')
            } else {
                req.session.success = "Password changed"
                res.redirect('/profile/change-password')
            }
        } catch (error) {
            next(error)
        }

    },
    getChangeEmail: async (req, res, next) => {
        let user = req.session._BR_USER
        try {
            if (req.session.success) {
                res.render('user/change-email', { title: 'Change Email | Bristles', user, "success": req.session.success })
                req.session.success = false
            } else if (req.session.error) {
                res.render('user/change-email', { title: 'Change Email | Bristles', user, "error": req.session.error })
                req.session.error = false
            } else {
                res.render('user/change-email', { title: 'Change Email | Bristles', user })
            }

        } catch (error) {
            res.render('error/user-found', { title: 'Change Email | Bristles', user })

        }
    },
    postChangeEmail: async (req, res, next) => {
        try {
            let response = await userHelper.changeEmail(req.body)
            if (response.emailErr) {
                req.session.error = "This email already used"
                res.redirect('/profile/change-email')
            } else {
                req.session._BR_USER.email = response
                req.session.success = "Email changed"
                res.redirect('/profile/change-email')
            }

        } catch (error) {
            next(error)
        }

    },
    getAlladdress: async (req, res, next) => {
        let user = req.session._BR_USER
        try {
            let address = await userHelper.getAlladdress(user.urId)
            if (req.session.success) {
                res.render('user/address', { title: 'Mangae Address | Bristles', user, address, 'success': req.session.success })
                req.session.success = false
            } else {
                res.render('user/address', { title: 'Mangae Address | Bristles', user, address })
            }

        } catch (error) {
            res.render('error/user-found', { title: 'Mangae Address | Bristles', user, })

        }

    },
    postAddAddress: async (req, res, next) => {
        try {
            await userHelper.addNewAddress(req.body, req.session._BR_USER.urId)
            res.redirect('/address')

        } catch (error) {
            next(error)
        }

    },
    postEditAddress: async (req, res, next) => {
        let user = req.session._BR_USER
        try {
            let adId = req.params.adId
            let response = await userHelper.updateAddress(req.body, adId, user.urId)
            // req.session.success = "Address updated"
            res.json(response)

        } catch (error) {
            next(error)
        }

    },
    deleteAddress: async (req, res, next) => {
        try {
            let user = req.session._BR_USER
            let response = await userHelper.deleteAddress(req.body.adId, user.urId)
            // req.session.success = "Address Deleted"
            res.json(response)

        } catch (error) {
            next(error)
        }

    },
    // Profile End

    // Cart Start
    getCartCount: async (req, res, next) => {
        try {
            let result = null
            if (req.session._BR_TOKEN) {
                result = await userHelper.getCartCount(req.session._BR_TOKEN)
            } else if (req.session._BR_USER) {
                result = await userHelper.getCartCount(req.session._BR_USER.urId)
            } else {
                result = 0
            }
            res.json(result)

        } catch (error) {
            next(error)
        }
    },

    getCart: async (req, res, next) => {
        let user = req.session._BR_USER
        try {

            let urId = null
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
            let ogTotal = 0
            for (let i = 0; i < products.length; i++) {
                if (products[i].cartItems.ogPrice) {
                    ogTotal = ogTotal + Number(products[i].cartItems.ogPrice)
                } else {
                    ogTotal = ogTotal + Number(products[i].cartItems.price)
                }
            }
            for (let i = 0; i < products.length; i++) {
                if (products[i].cartItems.ogPrice) {
                    discount = discount + (Number(products[i].cartItems.ogPrice) - Number(products[i].cartItems.price))
                }
            }

            if (req.session.success) {
                res.render('user/cart', { title: 'Cart | Bristles', user, products, total, discount, ogTotal, "success": req.session.success })
                req.session.success = false
            } else {
                res.render('user/cart', { title: 'Cart | Bristles', user, products, total, discount, ogTotal, })
            }
        } catch (error) {

            res.render('error/user-found', { title: 'Cart | Bristles', user, })
        }
    },

    removeFromCart: async (req, res, next) => {
        let user = req.session._BR_USER
        try {
            let urId = null
            if (req.session._BR_TOKEN) {
                urId = req.session._BR_TOKEN
            } else if (user) {
                urId = user.urId
            }
            let result = await userHelper.removeProductFromCart(req.body.prId, urId)
            req.session.success = "Removed form Cart"
            res.json(result)

        } catch (error) {
            next(error)
        }

    },
    getBuyNow: async (req, res) => {
        try {
            let prId = req.params.prId

        } catch (error) {

        }
    },
    // Cart End

    // CheckOut Start
    getCheckOut: async (req, res, next) => {
        let user = req.session._BR_USER

        try {
            let products = []
            let address = await userHelper.getAlladdress(user.urId)
            let total = 0
            let discount = 0
            let ogTotal = 0
            let BuyNow = false
            if (req.query.buynow) {

                let oneProduct = await adminHelpers.getOneProduct(req.query.prId)

                if (oneProduct.ogPrice) {
                    ogTotal = Number(oneProduct.ogPrice)
                } else {
                    ogTotal = Number(oneProduct.price)
                }
                total = Number(oneProduct.price)

                if (oneProduct.ogPrice) {
                    discount = (Number(oneProduct.ogPrice) - Number(oneProduct.price))
                }
                products[0] = oneProduct
                BuyNow = true

            } else {
                products = await userHelper.getCartProduct(user.urId)
                for (let i = 0; i < products.length; i++) {
                    if (products[i].cartItems.ogPrice) {
                        ogTotal = ogTotal + Number(products[i].cartItems.ogPrice)
                    } else {
                        ogTotal = ogTotal + Number(products[i].cartItems.price)
                    }
                }
                for (let i = 0; i < products.length; i++) {
                    total = total + Number(products[i].cartItems.price)
                }
                for (let i = 0; i < products.length; i++) {
                    if (products[i].cartItems.ogPrice) {
                        discount = discount + (Number(products[i].cartItems.ogPrice) - Number(products[i].cartItems.price))
                    }
                }
            }


            res.render('user/checkout', { title: 'Checkout | Bristles', user, products, total, discount, address, ogTotal, BuyNow })

        } catch (error) {
            res.render('error/user-found', { title: 'Checkout | Bristles', user, })

        }

    },
    changeCurrentAddress: async (req, res, next) => {
        try {
            let response = await userHelper.changeCurrentAddress(req.body.adId, req.session._BR_USER.urId)
            res.json(response)

        } catch (error) {
            next(error)
        }

    },
    checkCouponCode: async (req, res, next) => {
        try {
            let response = await userHelper.checkCouponCode(req.body)
            res.json(response)

        } catch (error) {
            next(error)
        }

    },
    verifyPayment: async (req, res, next) => {
        try {
            userHelper.verifyPayment(req.body).then(async () => {
                await userHelper.changePaymentStatus(req.body)
                await userHelper.savePaymentDetails(req.body)
                res.json({ status: true })

            }).catch((err) => {
                res.json({ status: false, errMag: err })
            })

        } catch (error) {
            next(error)
        }
    },
    // CheckOut End

    // Order Start
    postOrder: async (req, res, next) => {
        let user = req.session._BR_USER
        console.log('hi');
        try {

            let response = await userHelper.orderAccessing(req.body, user.urId)

            if (response.methord == "COD") {
                await userHelper.afterOreder(response.products, user.urId, req.body.cpCode)
                res.json({ codSuccess: true })

            } else if (response.methord == 'online') {
                await userHelper.afterOreder(response.products, user.urId, req.body.cpCode)
                let generateResponse = await userHelper.generateRazorpay(response.orId, response.amount)
                generateResponse.name = response.name
                generateResponse.email = user.email
                generateResponse.phone = response.phone
                generateResponse.urId = user.urId
                res.json(generateResponse)

            }
        } catch (error) {
            next(error)
        }

    },
    successOrder: async (req, res, next) => {
        let user = req.session._BR_USER
        try {
            res.render('user/success-order', { title: 'Order Success | Bristles', user, })

        } catch (error) {
            res.render('error/user-found', { title: 'Order Success | Bristles', user, })

        }
    },
    failedOrder: async (req, res, next) => {
        let user = req.session._BR_USER
        try {
            let reason = null
            res.render('user/payment-failed', { title: 'Order Success | Bristles', user, reason })

        } catch (error) {
            res.render('error/user-found', { title: 'Order Success | Bristles', user, })

        }
    },
    getOrder: async (req, res, next) => {
        let user = req.session._BR_USER
        try {
            let order = await userHelper.getAllOrder(user.urId)
            if (req.session.error) {
                res.render('user/order-list', { title: 'Order List | Bristles', user, order, 'error': req.session.error })
                req.session.error = false
            } else {

                res.render('user/order-list', { title: 'Order List | Bristles', user, order })
            }

        } catch (error) {
            res.render('error/user-found', { title: 'Order List | Bristles', user, })

        }

    },
    getOneOrder: async (req, res, next) => {
        try {
            let orId = req.query.orId
            let urId = req.query.urId
            let prId = req.query.prId
            let user = req.session._BR_USER
            let order = await userHelper.getOneOrder(urId, orId, prId)
            res.render('user/view-one-order', { title: 'View Order | Bristles', user, order })

        } catch (error) {
            res.render('error/user-found', { title: 'View Order | Bristles', user, })

        }

    },
    getCancelOrder: async (req, res, next) => {
        try {
            let orId = req.body.orId
            let response = await userHelper.cancelOrder(orId)
            res.json(response)
        } catch (error) {
            next(error)
        }

    },
    pendingPaymentCall: async (req, res, next) => {
        let user = req.session._BR_USER
        try {
            let generateResponse = await userHelper.generateRazorpay(req.body.orId, req.body.amount)
            generateResponse.name = req.body.name
            generateResponse.email = user.email
            generateResponse.phone = req.body.phone
            generateResponse.urId = user.urId
            res.json(generateResponse)

        } catch (error) {
            next(error)
        }

    },
    downloadOrderListXLFile: async (req, res, next) => {
        try {
            let orId = req.query.orId

            let orderData = await adminHelpers.getOneOrderForXL(orId)
            // Set to JSON and Path
            orderDate = JSON.stringify(orderData)
            console.log('hi');
            let filePath = path.join(__dirname, '../public/files/excel/' + orderData[0].ORDER_ID + '.xlsx')
            let xls = json2xls(JSON.parse(orderDate));
            console.log('hia');
            // Write file
            fs.writeFileSync(filePath, xls, 'binary', function (err) {
                if (err) console.log(err);
                return err;
            });
            // Download File
            res.download(filePath, (err) => {
                if (err) {
                    fs.unlinkSync(filePath)
                    req.session.error = 'Could not download the file'
                    res.redirect('/order')
                } else {
                    fs.unlinkSync(filePath)
                }
            })

        } catch (error) {
            next(error)
        }
    },
    // Order End

    // Wish Start
    wishProduct: async (req, res, next) => {
        let user = req.session._BR_USER
        try {
            if (user) {
                let response = await userHelper.wishProduct(req.body.prId, user.urId)
                res.json(response)
            } else {
                res.json({ nullUser: true })
            }

        } catch (error) {
            next(error)
        }
    },
    getAllWishlist: async (req, res, next) => {
        let user = req.session._BR_USER
        try {
            let wishlist = await userHelper.getAllWishlist(user.urId)
            res.render('user/wishlist', { title: 'Wishlist | Bristles', user, wishlist })

        } catch (error) {

            res.render('error/user-found', { title: 'Wishlist | Bristles', user, })
        }

    }
    // Wish End


}