const fs = require('fs');
const path = require('path');
const artistHelpers = require('../helpers/artist-helpers');
const userHelper = require('../helpers/user-helpres');
const adminHelpers = require('../helpers/admin-helpers');
const optionHelpers = require('../helpers/option-helper');
var json2xls = require('json2xls');


module.exports = {

    // Dashboard Start
    getDashboard: async (req, res, next) => {
        let admin = req.session._BR_ADMIN
        let CAT = req.session._BR_CAT
        try {
            let countObj = await adminHelpers.getDashboardCountObj()
            res.render('admin/dashboard', { title: "Dashboard | Admin panel", admin, CAT, countObj })
        } catch (error) {
            res.render('error/admin-found', { title: "Dashboard | Admin panel", admin, CAT })
        }
    },
    getTotalRevenueList: async (req, res, next) => {
        try {
            let response = []
            let totalRevenueList = await adminHelpers.getTotalRevenueList()

            res.json(totalRevenueList)
        } catch (error) {
            next(error)
        }
    },
    getOrderMethodChart: async (req, res, next) => {
        try {
            let chartOrder = await adminHelpers.getOrderMethodChart()

            res.json(chartOrder)
        } catch (error) {

            next(error)
        }
    },
    getCategoryProductsChart: async (req, res, next) => {
        try {
            let chartCategory = await adminHelpers.getCategoryChart()
            res.json(chartCategory)
        } catch (error) {
            next(error)
        }
    },
    getDeliveryChart: async (req, res, next) => {
        try {
            let DeliveryChart = await adminHelpers.getDeliveryChart()
            res.json(DeliveryChart)
        } catch (error) {
            next(error)
        }
    },

    // Dashboard End

    // Sign Start
    getSignIn: async (req, res, next) => {
        try {
            if (req.session._BR_ADMIN) {
                res.redirect('/admin')
            } else if (req.session.error) {
                res.render('admin/sign-in', { title: "Admin Sign In", "error": req.session.error })
                req.session.error = false
            } else {
                res.render('admin/sign-in', { title: "Admin Sign In" })
            }
        } catch (error) {
            next(error)
        }
    },
    postSignIn: async (req, res, next) => {
        try {
            let response = await adminHelpers.doSignIn(req.body)
            if (response.emailError) {
                req.session.error = "Invalid email address"
                res.redirect('/admin/sign-in')
            } else if (response.passError) {
                req.session.error = "Incorrect password"
                res.redirect('/admin/sign-in')
            } else {
                let category = await adminHelpers.getAllCategory()
                req.session._BR_ADMIN = response
                req.session._BR_CAT = category
                res.redirect('/admin')

            }


        } catch (error) {
            next(error)
        }
    },
    signOut: async (req, res, next) => {
        try {
            req.session._BR_ADMIN = null
            req.session._BR_CAT = null
            res.redirect('/admin/sign-in')

        } catch (error) {
            next(error)
        }
    },

    // Sign End

    // Profile Start
    getProfile: async (req, res, next) => {
        let admin = req.session._BR_ADMIN
        let CAT = req.session._BR_CAT
        try {
            res.render('admin/profile', { title: "Add Category | Admin panel", admin, CAT, })
        } catch (error) {
            res.render('error/admin-found', { title: "Add Category | Admin panel", admin, CAT, })
        }
    },
    // Profile End

    // Carousel Start
    getCarousel: async (req, res, next) => {
        let admin = req.session._BR_ADMIN
        let CAT = req.session._BR_CAT
        try {
            let carousel = await adminHelpers.getCarousel()
            if (req.session.success) {
                res.render('admin/carousel', { title: "View product | Admin panel", admin, CAT, carousel, "success": req.session.success })
                req.session.success = false
            } else {
                res.render('admin/carousel', { title: "View product | Admin panel", admin, CAT, carousel })
            }


        } catch (error) {
            res.render('error/admin-found', { title: "View product | Admin panel", admin, CAT })

        }
    },
    addCarousel: async (req, res, next) => {
        try {
            let image = null
            if (req.file) {
                image = req.file.filename
            }
            req.body.image = image
            adminHelpers.addCarousel(req.body)
            req.session.success = "New carousel created"
            res.redirect('/admin/carousel');


        } catch (error) {
            next(error)
        }
    },
    deleteCarousel: async (req, res, next) => {
        try {
            let image = adminHelpers.deleteCarousel(req.params.crId)
            if (image) {
                var Imagepath = path.join(__dirname, '../public/images/carousel/' + image)
                fs.unlink(Imagepath, function (err) {
                    if (err)
                        return err;
                });
            }
            req.session.success = "Carousel Removed from Database"
            res.redirect('/admin/carousel')


        } catch (error) {
            next(error)
        }
    },
    // Carousel End

    // Product Start
    getProductList: async (req, res, next) => {
        let admin = req.session._BR_ADMIN
        let CAT = req.session._BR_CAT
        try {
            let NOW_CAT = req.params._CAT
            let productslist = await adminHelpers.getAllCatProduct(NOW_CAT)
            if (req.session.success) {
                res.render('admin/product-list', {
                    title: "Products | Admin panel", admin, CAT, NOW_CAT, productslist, "success": req.session.success
                })
                req.session.success = false
            } else {
                res.render('admin/product-list', { title: "Products | Admin panel", admin, CAT, NOW_CAT, productslist })
            }

        } catch (error) {

            res.render('error/admin-found', { title: "Products | Admin panel", admin, CAT, })
        }

    },
    getAddProduct: async (req, res, next) => {
        let admin = req.session._BR_ADMIN
        let CAT = req.session._BR_CAT
        try {
            let NOW_CAT = req.params._CAT
            if (req.session.success) {
                res.render('admin/add-product', {
                    title: "Add products | Admin panel", admin, CAT, NOW_CAT, "success": req.session.success
                })
                req.session.success = false
            } else {
                res.render('admin/add-product', { title: "Add products | Admin panel", admin, CAT, NOW_CAT, optionHelpers })
            }

        } catch (error) {
            res.render('error/admin-found', { title: "Add products | Admin panel", admin, CAT, })
        }
    },
    postAddProduct: async (req, res, next) => {
        try {
            let cgId = req.params.NOW_CAT
            let image = []
            for (let i = 0; i < req.files.length; i++) {
                image[i] = req.files[i].filename
            }
            req.body.image = image
            adminHelpers.addProduct(req.body)
            req.session.success = "New product created"
            res.redirect('/admin/products/' + cgId + "/add-product")

        } catch (error) {
            next(error)
        }
    },
    getEditProduct: async (req, res, next) => {
        let admin = req.session._BR_ADMIN
        let CAT = req.session._BR_CAT
        try {

            let NOW_CAT = req.params._CAT
            let product = await adminHelpers.getOneProduct(req.params.proId)
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
            res.render('admin/edit-product', { title: "Edit product | Admin panel", admin, CAT, NOW_CAT, product, optionHelpers })

        } catch (error) {

            res.render('error/admin-found', { title: "Edit product | Admin panel", admin, CAT, })
        }
    },
    postEditProduct: async (req, res, next) => {
        try {

            let cgId = req.params.NOW_CAT
            let image = []
            for (let i = 0; i < req.files.length; i++) {
                image[i] = req.files[i].filename
            }
            req.body.image = image
            let imageArry = await adminHelpers.editProduct(req.body)
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
            res.redirect('/admin/products/' + cgId)

        } catch (error) {
            next(error)
        }
    },
    deleteProduct: async (req, res, next) => {
        try {
            let NOW_CAT = req.params.NOW_CAT
            let prId = req.params.prId
            adminHelpers.deleteProduct(prId)
            req.session.success = "Product removed from list"
            res.redirect('/admin/products/' + NOW_CAT)


        } catch (error) {
            next(error)
        }
    },
    getViewProduct: async (req, res, next) => {
        let admin = req.session._BR_ADMIN
        let CAT = req.session._BR_CAT
        try {
            let NOW_CAT = req.params.NOW_CAT
            let prId = req.params.prId
            let product = await adminHelpers.getOneProduct(prId)
            if (req.session.success) {
                res.render('admin/view-product', { title: "View product | Admin panel", admin, CAT, NOW_CAT, product, "success": req.session.success })
                req.session.success = false
            } else {
                res.render('admin/view-product', { title: "View product | Admin panel", admin, CAT, NOW_CAT, product })

            }

        } catch (error) {

            res.render('error/admin-found', { title: "View product | Admin panel", admin, CAT, })
        }
    },
    // Product End

    // Pending Start
    getPendingProductList: async (req, res, next) => {
        let admin = req.session._BR_ADMIN
        let CAT = req.session._BR_CAT
        try {

            let NOW_CAT = req.params._CAT
            let productslist = await adminHelpers.getAllCatPending(NOW_CAT)
            if (req.session.success) {
                res.render('admin/pending-list', {
                    title: "Pending Products | Admin panel", admin, CAT, NOW_CAT, productslist, "success": req.session.success
                })
                req.session.success = false
            } else {
                res.render('admin/pending-list', { title: "Pending Products | Admin panel", admin, CAT, NOW_CAT, productslist })
            }
        } catch (error) {
            res.render('error/admin-found', { title: "Pending Products | Admin panel", admin, CAT, })

        }

    },
    viewOnePendingProduct: async (req, res, next) => {
        let admin = req.session._BR_ADMIN
        let CAT = req.session._BR_CAT
        try {
            let NOW_CAT = req.params.NOW_CAT
            let prId = req.params.prId
            let product = await adminHelpers.getOneProduct(prId)
            res.render('admin/view-pending', { title: "View product | Admin panel", admin, CAT, NOW_CAT, product })

        } catch (error) {
            res.render('error/admin-found', { title: "View product | Admin panel", admin, CAT, })
        }


    },
    approveOrRejectPendingProduct: async (req, res, next) => {
        try {

            let NOW_CAT = req.params.NOW_CAT
            let prId = req.params.prId
            let choose = req.params.choose
            let response = await adminHelpers.approveAndRejectProduct(prId, choose)
            if (response.approve) {
                req.session.success = "This Product Approved"
                res.redirect('/admin/pending-products/' + NOW_CAT)
            } else if (response.reject) {
                req.session.success = "This Product Rejected"
                res.redirect('/admin/pending-products/' + NOW_CAT)
            }
        } catch (error) {
            next(error)
        }

    },
    // Pending End

    // Category start
    getCategory: async (req, res, next) => {
        let admin = req.session._BR_ADMIN
        let CAT = req.session._BR_CAT
        try {
            let category = await adminHelpers.getAllCategory()
            if (req.session.success) {
                res.render('admin/category', { title: "Category | Admin panel", admin, CAT, category, "success": req.session.success })
                req.session.success = false
            } else if (req.session.error) {
                res.render('admin/category', { title: "Category | Admin panel", admin, CAT, category, "error": req.session.error })
                req.session.error = false
            } else {
                res.render('admin/category', { title: "Category | Admin panel", admin, CAT, category })
            }

        } catch (error) {
            res.render('error/admin-found', { title: "Category | Admin panel", admin, CAT, })

        }

    },
    getAddCategory: async (req, res, next) => {
        let admin = req.session._BR_ADMIN
        let CAT = req.session._BR_CAT
        try {
            if (req.session.error) {
                res.render('admin/add-category', { title: "Add Category | Admin panel", admin, CAT, "error": req.session.error })
                req.session.error = false
            } else {
                res.render('admin/add-category', { title: "Add Category | Admin panel", admin, CAT })
            }

        } catch (error) {

            res.render('error/admin-found', { title: "Add Category | Admin panel", admin, CAT })
        }
    },
    postAddCategory: async (req, res, next) => {
        try {
            let result = await adminHelpers.addCategory(req.body)
            if (result.nameError) {
                req.session.error = "This title already used"
                res.redirect('/admin/category/add-category')
            } else if (result) {
                let category = await adminHelpers.getAllCategory()
                req.session._BR_CAT = category
                req.session.success = "New category created"
                res.redirect('/admin/category')

            }

        } catch (error) {
            next(error)
        }

    },
    getEditCategory: async (req, res, next) => {
        let admin = req.session._BR_ADMIN
        let CAT = req.session._BR_CAT
        try {
            let category = await adminHelpers.getOneCategroy(req.params.id)
            if (req.session.error) {
                res.render('admin/edit-category', { title: "Edit category | Admin panel", admin, CAT, category, "error": req.session.error })
                req.session.error = false
            } else {
                res.render('admin/edit-category', { title: "Edit category | Admin panel", admin, CAT, category })
            }

        } catch (error) {

            res.render('error/admin-found', { title: "Edit category | Admin panel", admin, CAT, })
        }

    },
    postEditCategory: async (req, res, next) => {
        try {
            let id = req.params.id
            let result = await adminHelpers.editCategory(req.body, id)
            if (result.nameError) {
                req.session.error = "This category already used"
                res.redirect('/admin/category/' + id + '/edit')
            } else {
                let category = await adminHelpers.getAllCategory()
                req.session._BR_CAT = category
                req.session.success = "New category created"
                res.redirect('/admin/category')

            }

        } catch (error) {
            next(error)
        }

    },
    deleteCategory: async (req, res, next) => {
        try {
            let result = await adminHelpers.deleteCategory(req.params.title)
            if (result.categoryError) {
                req.session.error = 'Remove the category products first'
                res.redirect('/admin/category')
            } else {
                let category = await adminHelpers.getAllCategory()
                req.session._BR_CAT = category
                res.redirect('/admin/category')
            }
        } catch (error) {
            next(error)
        }
    },
    // Category End

    // Coupon Start
    getAllCoupon: async (req, res, next) => {
        let admin = req.session._BR_ADMIN
        let CAT = req.session._BR_CAT
        try {
            let coupon = await adminHelpers.getAllCoupon()
            if (req.session.success) {
                res.render('admin/coupon-list', { title: "Coupon List | Admin panel", admin, CAT, coupon, "success": req.session.success })
                req.session.success = false
            } else {
                res.render('admin/coupon-list', { title: "Coupon List | Admin panel", admin, CAT, coupon })
            }

        } catch (error) {

            res.render('error/admin-found', { title: "Coupon List | Admin panel", admin, CAT, })
        }


    },
    getAddCoupon: async (req, res, next) => {
        let admin = req.session._BR_ADMIN
        let CAT = req.session._BR_CAT
        try {
            res.render('admin/add-coupon', { title: "Add Coupon | Admin panel", admin, CAT })

        } catch (error) {
            res.render('error/admin-found', { title: "Add Coupon | Admin panel", admin, CAT })

        }
    },
    postAddCoupon: async (req, res, next) => {
        try {
            adminHelpers.addCoupon(req.body)
            req.session.success = 'New Coupon Added'
            res.redirect('/admin/coupon')

        } catch (error) {
            next(error)
        }

    },
    getEditCoupon: async (req, res, next) => {
        let admin = req.session._BR_ADMIN
        let CAT = req.session._BR_CAT
        try {
            let cpCode = req.params.cpCode
            let coupon = await adminHelpers.getOneCoupon(cpCode)
            res.render('admin/edit-coupon', { title: "Edit Coupon | Admin panel", admin, CAT, coupon })

        } catch (error) {
            res.render('error/admin-found', { title: "Edit Coupon | Admin panel", admin, CAT, })

        }

    },
    postEditCoupon: async (req, res, next) => {
        try {
            adminHelpers.editCoupon(req.body)
            req.session.success = 'Coupon Edited'
            res.redirect('/admin/coupon')

        } catch (error) {
            next(error)
        }

    },
    deleteCoupon: async (req, res, next) => {
        try {
            let cpCode = req.params.cpCode
            adminHelpers.deleteCoupon(cpCode)
            req.session.success = 'Coupon Deleted'
            res.redirect('/admin/coupon')

        } catch (error) {
            next(error)
        }

    },
    // Coupon End

    // Artist New Start
    getPendigArtistList: async (req, res, next) => {
        let admin = req.session._BR_ADMIN
        let CAT = req.session._BR_CAT
        try {
            let artist = await adminHelpers.getAllPendingArtist()
            if (req.session.success) {
                res.render('admin/artist-pending-list', { title: "Pending Artists | Admin panel", admin, CAT, artist, "success": req.session.success })
                req.session.success = false
            } else if (req.session.error) {
                res.render('admin/artist-pending-list', { title: "Pending Artists | Admin panel", admin, CAT, artist, "error": req.session.error })
                req.session.error = false
            } else {
                res.render('admin/artist-pending-list', { title: "Pending Artists | Admin panel", admin, CAT, artist })
            }

        } catch (error) {
            res.render('error/admin-found', { title: "Pending Artists | Admin panel", admin, CAT })

        }

    },
    viewOnePendingArtist: async (req, res, next) => {
        let admin = req.session._BR_ADMIN
        let CAT = req.session._BR_CAT
        try {

            let arId = req.params.arId
            let artist = await artistHelpers.getArtist(arId)

            if (artist.exception) {
                req.session.error = "Invalid Aritist Id"
                res.render('admin/view-pending-artist', { title: "View Artist | Admin panel", admin, CAT, artist, "error": req.session.error })
                req.session.error = false
            } else if (req.session.success) {
                res.render('admin/view-pending-artist', { title: "View Artist | Admin panel", admin, CAT, artist, "success": req.session.success })
                req.session.success = false
            } else {
                res.render('admin/view-pending-artist', { title: "View Artist | Admin panel", admin, CAT, artist })
            }
        } catch (error) {

            res.render('error/admin-found', { title: "View Artist | Admin panel", admin, CAT, })
        }

    },
    approveArtist: async (req, res, next) => {
        try {
            let arId = req.params.arId
            adminHelpers.approveArtist(arId)
            req.session.success = 'Account approved'
            res.redirect('/admin/artist/new-account' + arId + '/view')

        } catch (error) {
            next(error)
        }

    },
    rejectArtist: async (req, res, next) => {
        try {
            let arId = req.params.arId
            adminHelpers.rejectArtist(arId)
            req.session.success = 'Account Rejected'
            res.redirect('/admin/artist/new-account')

        } catch (error) {
            next(error)
        }

    },
    // Artist New End

    // Artist Start
    getArtistList: async (req, res, next) => {
        let admin = req.session._BR_ADMIN
        let CAT = req.session._BR_CAT
        try {
            let artist = await adminHelpers.getAllArtist()
            if (req.session.success) {
                res.render('admin/artist-list', { title: "Artists | Admin panel", admin, CAT, artist, "success": req.session.success })
                req.session.success = false
            } else {
                res.render('admin/artist-list', { title: "Artists | Admin panel", admin, CAT, artist })
            }

        } catch (error) {

            res.render('error/admin-found', { title: "Artists | Admin panel", admin, CAT, })
        }

    },
    getOneArtist: async (req, res, next) => {
        let admin = req.session._BR_ADMIN
        let CAT = req.session._BR_CAT
        try {
            let arId = req.params.arId
            let artist = await artistHelpers.getArtist(arId)

            if (artist.exception) {
                req.session.error = "Invalid Aritist Id"
                res.render('admin/view-artist', { title: "View Artist | Admin panel", admin, CAT, artist, "error": req.session.error })
                req.session.error = false
            } else if (req.session.success) {
                res.render('admin/view-artist', { title: "View Artist | Admin panel", admin, CAT, artist, "success": req.session.success })
                req.session.success = false
            } else {
                res.render('admin/view-artist', { title: "View Artist | Admin panel", admin, CAT, artist })
            }

        } catch (error) {
            res.render('error/admin-found', { title: "View Artist | Admin panel", admin, CAT, })

        }

    },
    blockAndActiveArtist: async (req, res, next) => {
        try {
            let response = await adminHelpers.activeAndBlockArtist(req.params.arId, req.params.status)
            req.session.success = response.message
            res.redirect('/admin/artist/all-artist')

        } catch (error) {
            next(error)
        }

    },
    getPendingItemOfArtist: async (req, res, next) => {
        let admin = req.session._BR_ADMIN
        let CAT = req.session._BR_CAT
        try {
            let arId = req.params.arId
            let artist = await artistHelpers.getArtist(arId)
            let products = await artistHelpers.getPendingList(arId)

            res.render('admin/artist-pending-item', { title: "Pending List | Admin panel", admin, CAT, products, artist })

        } catch (error) {
            res.render('error/admin-found', { title: "Pending List | Admin panel", admin, CAT, })

        }

    },
    getArtistProduct: async (req, res, next) => {
        let admin = req.session._BR_ADMIN
        let CAT = req.session._BR_CAT
        try {
            let arId = req.params.arId
            let artist = await artistHelpers.getArtist(arId)
            let products = await artistHelpers.getAllProducts(arId)

            res.render('admin/artist-products-list', { title: "Product List | Admin panel", admin, CAT, products, artist })

        } catch (error) {

            res.render('error/admin-found', { title: "Product List | Admin panel", admin, CAT, })
        }

    },
    // Artist End

    // User Start
    getUserList: async (req, res, next) => {
        let admin = req.session._BR_ADMIN
        let CAT = req.session._BR_CAT
        try {
            let user = await adminHelpers.getAllUser()
            if (req.session.success) {
                res.render('admin/user-list', { title: "User List | Admin panel", admin, CAT, user, 'success': req.session.success })
                req.session.success = false
            } else {
                res.render('admin/user-list', { title: "User List | Admin panel", admin, CAT, user })
            }

        } catch (error) {
            res.render('error/admin-found', { title: "User List | Admin panel", admin, CAT, })

        }

    },
    getUserView: async (req, res, next) => {
        let admin = req.session._BR_ADMIN
        let CAT = req.session._BR_CAT
        try {
            let urId = req.params.urId
            let user = await userHelper.getUser(urId)
            res.render('admin/view-user', { title: "View User | Admin panel", admin, CAT, user })

        } catch (error) {

            res.render('error/admin-found', { title: "View User | Admin panel", admin, CAT, })
        }

    },
    blockAndActiveUser: async (req, res, next) => {
        try {
            let response = await adminHelpers.activeAndBlockUser(req.params.urId, req.params.status)
            req.session.success = response.message
            res.redirect('/admin/user-list')

        } catch (error) {
            next(error)
        }

    },
    getUserOrder: async (req, res, next) => {
        let admin = req.session._BR_ADMIN
        let CAT = req.session._BR_CAT
        try {
            let order = await adminHelpers.getOneUserOrder(req.params.urId)

            res.render('admin/view-user-orders', { title: "View User | Admin panel", admin, CAT, order })

        } catch (error) {
            res.render('admin/view-user-orders', { title: "View User | Admin panel", admin, CAT, })
        }
    },
    // User End

    // Order Start
    getAllOrder: async (req, res, next) => {
        let admin = req.session._BR_ADMIN
        let CAT = req.session._BR_CAT
        try {
            let order = await adminHelpers.getAllOrder()
            if (req.session.error) {
                res.render('admin/order-list', { title: "Order List | Admin panel", admin, CAT, order, 'error': req.session.error })
                req.session.error = false
            } else {
                res.render('admin/order-list', { title: "Order List | Admin panel", admin, CAT, order })
            }
        } catch (error) {
            res.render('error/admin-found', { title: "Order List | Admin panel", admin, CAT, })
        }

    },
    getOneOrder: async (req, res, next) => {
        let admin = req.session._BR_ADMIN
        let CAT = req.session._BR_CAT
        try {
            let orId = req.query.orId
            let order = await adminHelpers.getOneOrder(orId, req.query.prId)

            res.render('admin/view-order', { title: "View Order | Admin panel", admin, CAT, order })

        } catch (error) {

            res.render('error/admin-found', { title: "View Order | Admin panel", admin, CAT, })
        }

    },
    changeOrderStatus: async (req, res, next) => {
        try {
            let response = await adminHelpers.changeOrderStatus(req.body)
            res.json(response)

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

            let filePath = path.join(__dirname, '../public/files/excel/' + orderData[0].ORDER_ID + '.xlsx')
            let xls = json2xls(JSON.parse(orderDate));

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
                    res.redirect('/admin/order-list')
                } else {
                    fs.unlinkSync(filePath)
                }
            })

        } catch (error) {
            next(error)
        }
    },
    // Order End

    // Payment Start
    getOnePaymentDetails: async (req, res, next) => {
        let admin = req.session._BR_ADMIN
        let CAT = req.session._BR_CAT
        try {
            let orId = req.query.orId
            let details = await adminHelpers.getOnePaymentDetails(orId)
            res.render('admin/view-payment', { title: "Payment Details | Admin panel", admin, CAT, details })

        } catch (error) {
            res.render('error/admin-found', { title: "Payment Details | Admin panel", admin, })

        }

    }
    // Payment End


}