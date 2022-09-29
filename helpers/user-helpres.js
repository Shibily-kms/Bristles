const db = require('../config/connection')
const collection = require('../config/collection')
const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');

const Razorpay = require('razorpay');
const instance = new Razorpay({
    key_id: 'rzp_test_59KOR6eRcVHKh4',
    key_secret: 'rEbNwpcSpVyBYMnDxcAauA6W',
});


module.exports = {
    // User Sign Start
    verifyEmail: (email) => {
        return new Promise(async (resolve, reject) => {
            try {
                let response = await db.get().collection(collection.USER_COLLECTION).findOne({ email })
                let obj = {
                    data: response,
                    emailError: true
                }
                if (response) {
                    resolve(obj)
                } else {
                    resolve({ status: true })
                }


            } catch (error) {
                reject(error)
            }
        })
    },
    doSignUp: (body) => {
        return new Promise(async (resolve, reject) => {
            try {
                // Create Random Id
                create_random_id(5)
                function create_random_id(sting_length) {
                    var randomString = '';
                    var numbers = '123456789'
                    for (var i, i = 0; i < sting_length; i++) {
                        randomString += numbers.charAt(Math.floor(Math.random() * numbers.length))
                    }
                    body.urId = "UR" + randomString
                    body.status = "Active"
                }
                body.password = await bcrypt.hash(body.password, 10)
                let result = await db.get().collection(collection.USER_COLLECTION).insertOne(body)
                resolve(result)


            } catch (error) {
                reject(error)
            }
        })
    },

    doSignIn: (body) => {
        return new Promise(async (resolve, reject) => {
            try {
                let data = await db.get().collection(collection.USER_COLLECTION).findOne({ email: body.email })
                if (data) {
                    let status = await bcrypt.compare(body.password, data.password)
                    if (status) {
                        delete data.password;
                        delete data.address;
                        resolve(data)
                    } else {
                        resolve({ passError: true })
                    }

                } else {
                    resolve({ emailError: true })
                }


            } catch (error) {
                reject(error)
            }
        })
    },
    setNewPassword: (body, urId) => {
        return new Promise(async (resolve, reject) => {
            try {
                body.password = await bcrypt.hash(body.password, 10)
                let result = await db.get().collection(collection.USER_COLLECTION).updateOne({ urId }, {
                    $set: {
                        password: body.password
                    }
                })
                resolve(result)


            } catch (error) {
                reject(error)
            }
        })
    },
    checkAccountActive: (urId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await db.get().collection(collection.USER_COLLECTION).findOne({ urId, status: "Active" })

                if (result) {
                    resolve(result)
                } else {
                    resolve({ activeErr: true })
                }


            } catch (error) {
                reject(error)
            }
        })
    },
    // Sign End

    // Set Token Start
    setToken: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let token = ''
                // Create Random Id
                create_random_id(10)
                function create_random_id(sting_length) {
                    var randomString = '';
                    var numbers = '123456789'
                    for (var i, i = 0; i < sting_length; i++) {
                        randomString += numbers.charAt(Math.floor(Math.random() * numbers.length))
                    }
                    token = "TK" + randomString
                }
                resolve(token)

            } catch (error) {
                reject(error)
            }
        })
    },
    // Set Token End

    // Product Start

    getAllProduct: (urId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let product = []
                if (urId) {
                    product = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                        {
                            $match: {
                                delete: false, status: "Approve"
                            }
                        },
                        {
                            $sort: {
                                _id: -1
                            }
                        },

                        {
                            $project: {
                                title: 1, size: 1, price: 1, image: 1,
                                prId: 1, category: 1, medium: 1, quality: 1, ogPrice: 1, percentage: 1, wishCount: 1,
                                urId: urId
                            }
                        },
                        {
                            $lookup: {
                                from: collection.USER_COLLECTION,
                                localField: 'urId',
                                foreignField: 'urId',
                                as: 'user'
                            }
                        },
                        {
                            $project: {
                                title: 1, size: 1, price: 1, image: 1,
                                prId: 1, category: 1, medium: 1, quality: 1, ogPrice: 1, percentage: 1, wishCount: 1,
                                wishlist: { $first: '$user.wishlist' }
                            }
                        },
                        {
                            $project: {
                                title: 1, size: 1, price: 1, image: 1,
                                prId: 1, category: 1, medium: 1, quality: 1, ogPrice: 1, percentage: 1, wishCount: 1,
                                wishlist: {
                                    $filter: {
                                        input: '$wishlist',
                                        as: 'item',
                                        cond: {
                                            $eq: ['$$item', "$prId"]
                                        }

                                    }
                                }
                            }

                        }
                    ]).toArray()

                } else {
                    product = await db.get().collection(collection.PRODUCT_COLLECTION).find({ delete: false, status: 'Approve' }).sort({ _id: -1 })
                        .toArray()
                }

                resolve(product)
            } catch (error) {
                reject(error)
            }
        })
    },
    getAllCatProduct: (CAT, urId) => {
        return new Promise(async (resolve, reject) => {
            try {

                let product = []
                if (urId) {
                    product = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                        {
                            $match: {
                                delete: false, status: "Approve", category: CAT,
                            }
                        },
                        {
                            $sort: {
                                _id: -1
                            }
                        },

                        {
                            $project: {
                                title: 1, size: 1, price: 1, image: 1,
                                prId: 1, category: 1, medium: 1, quality: 1, ogPrice: 1, percentage: 1, wishCount: 1,
                                urId: urId
                            }
                        },
                        {
                            $lookup: {
                                from: collection.USER_COLLECTION,
                                localField: 'urId',
                                foreignField: 'urId',
                                as: 'user'
                            }
                        },
                        {
                            $project: {
                                title: 1, size: 1, price: 1, image: 1,
                                prId: 1, category: 1, medium: 1, quality: 1, ogPrice: 1, percentage: 1, wishCount: 1,
                                wishlist: { $first: '$user.wishlist' }
                            }
                        },
                        {
                            $project: {
                                title: 1, size: 1, price: 1, image: 1,
                                prId: 1, category: 1, medium: 1, quality: 1, ogPrice: 1, percentage: 1, wishCount: 1,
                                wishlist: {
                                    $filter: {
                                        input: '$wishlist',
                                        as: 'item',
                                        cond: {
                                            $eq: ['$$item', "$prId"]
                                        }

                                    }
                                }
                            }

                        }
                    ]).toArray()
                } else {
                    product = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: CAT, status: { $in: ['Approve'] }, delete: false })
                }
                resolve(product)
            } catch (error) {
                reject(error)
            }
        })
    },
    getLatestProducts: (urId) => {
        return new Promise(async (resolve, reject) => {
            try {

                let product = []
                if (urId) {
                    product = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                        {
                            $match: {
                                delete: false, status: "Approve"
                            }
                        },
                        {
                            $sort: {
                                _id: -1
                            }
                        },
                        {
                            $limit: 8
                        },
                        {
                            $project: {
                                title: 1, size: 1, price: 1, image: 1,
                                prId: 1, category: 1, medium: 1, quality: 1, ogPrice: 1, percentage: 1, wishCount: 1,
                                urId: urId
                            }
                        },
                        {
                            $lookup: {
                                from: collection.USER_COLLECTION,
                                localField: 'urId',
                                foreignField: 'urId',
                                as: 'user'
                            }
                        },
                        {
                            $project: {
                                title: 1, size: 1, price: 1, image: 1,
                                prId: 1, category: 1, medium: 1, quality: 1, ogPrice: 1, percentage: 1, wishCount: 1,
                                wishlist: { $first: '$user.wishlist' }
                            }
                        },
                        {
                            $project: {
                                title: 1, size: 1, price: 1, image: 1,
                                prId: 1, category: 1, medium: 1, quality: 1, ogPrice: 1, percentage: 1, wishCount: 1,
                                wishlist: {
                                    $filter: {
                                        input: '$wishlist',
                                        as: 'item',
                                        cond: {
                                            $eq: ['$$item', "$prId"]
                                        }

                                    }
                                }
                            }

                        }
                    ]).toArray()
                } else {
                    product = await db.get().collection(collection.PRODUCT_COLLECTION).find({ delete: false, status: 'Approve' }).sort({ _id: -1 })
                        .limit(8).toArray()
                }
                resolve(product)
            } catch (error) {
                reject(error)
            }


        })
    },
    // Product End

    // User About Start
    getUser: (urId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await db.get().collection(collection.USER_COLLECTION).findOne({ urId })
                delete result.password;
                if (result) {
                    if (result.status == "Active") {
                        result.active = true
                    } else if (result.status == "Blocked") {
                        result.blocked = true
                    }
                    resolve(result)
                } else {
                    resolve({ exception: true })
                }
                resolve(result)


            } catch (error) {
                reject(error)
            }
        })
    },

    editProfile: (body) => {
        return new Promise(async (resolve, reject) => {
            try {

                let image = null
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ urId: body.urId })
                if (body.image == null) {
                    body.image = user.image
                } else {
                    image = user.image
                }

                db.get().collection(collection.USER_COLLECTION).updateOne({ urId: body.urId }, {
                    $set: {
                        firstName: body.firstName,
                        lastName: body.lastName,
                        userName: body.userName,
                        mobile: body.mobile,
                        place: body.place,
                        image: body.image
                    }
                })
                let obj = {
                    firstName: body.firstName,
                    lastName: body.lastName,
                    userName: body.userName,
                    email: user.email,
                    mobile: body.mobile,
                    place: body.place,
                    image: body.image,
                    urId: user.urId,
                    deleteImage: image
                }
                resolve(obj)


            } catch (error) {
                reject(error)
            }

        })
    },

    changePassword: (body) => {
        return new Promise(async (resolve, reject) => {
            try {

                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ urId: body.urId })
                if (user) {
                    let status = await bcrypt.compare(body.currentPassword, user.password)
                    if (status) {
                        let newPass = await bcrypt.hash(body.newPassword, 10)
                        let response = await db.get().collection(collection.USER_COLLECTION).updateOne({ urId: body.urId }, {
                            $set: {
                                password: newPass
                            }
                        })
                        resolve(response)

                    } else {
                        resolve({ passErr: true })
                    }

                }

            } catch (error) {
                reject(error)
            }
        })
    },

    changeEmail: (body) => {
        return new Promise(async (resolve, reject) => {
            try {
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: body.email })
                if (user) {
                    resolve({ emailErr: true })
                } else {
                    db.get().collection(collection.USER_COLLECTION).updateOne({ urId: body.urId }, {
                        $set: {
                            email: body.email
                        }
                    })
                    resolve(body.email)

                }


            } catch (error) {
                reject(error)
            }
        })
    },

    getAlladdress: (urId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await db.get().collection(collection.USER_COLLECTION).findOne({ urId })
                let address = []
                if (result.addresses) {
                    address.addresses = result.addresses
                    address.current = result.currentAddress
                    address.addresses = address.addresses.slice(-4);
                    for (let i = 0; i < address.addresses.length; i++) {
                        if (address.addresses[i].adId == address.current) {
                            address.addresses[i].current = true
                        }
                    }
                }
                resolve(address)


            } catch (error) {
                reject(error)
            }
        })
    },
    addNewAddress: (body, urId) => {
        return new Promise(async (resolve, reject) => {
            try {

                // Create Random Id
                create_random_id(5)
                function create_random_id(sting_length) {
                    var randomString = '';
                    var numbers = '123456789'
                    for (var i, i = 0; i < sting_length; i++) {
                        randomString += numbers.charAt(Math.floor(Math.random() * numbers.length))
                    }
                    body.adId = "AD" + randomString
                }
                db.get().collection(collection.USER_COLLECTION).update({ urId }, {
                    $push: {
                        addresses: body
                    },
                    $set: {
                        currentAddress: body.adId
                    }
                })
                resolve()

            } catch (error) {
                reject(error)
            }
        })
    },
    updateAddress: (body, adId, urId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let response = await db.get().collection(collection.USER_COLLECTION).updateOne({ urId, "addresses.adId": adId }, {
                    $set: {
                        "addresses.$.name": body.name,
                        "addresses.$.phone": body.phone,
                        "addresses.$.pincode": body.pincode,
                        "addresses.$.locality": body.locality,
                        "addresses.$.area": body.area,
                        "addresses.$.city": body.city,
                        "addresses.$.state": body.state,
                        "addresses.$.landmark": body.landmark
                    }
                })
                resolve(response)


            } catch (error) {
                reject(error)
            }
        })
    },
    deleteAddress: (adId, urId) => {
        return new Promise(async (resolve, reject) => {
            try {
                db.get().collection(collection.USER_COLLECTION).updateOne({ urId }, {
                    $pull: {
                        addresses: {
                            adId
                        }
                    }
                })
                resolve({ status: true })


            } catch (error) {
                reject(error)
            }
        })
    },
    // User About End

    // Cart Start
    addToCart: (urId, body) => {
        return new Promise(async (resolve, reject) => {
            try {

                let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ urId })
                if (cart) {
                    let status = await db.get().collection(collection.CART_COLLECTION).findOne({ urId, list: { $in: [body.prId] } })
                    if (status) {
                        resolve({ alreadyErr: true })
                    } else {
                        let response = await db.get().collection(collection.CART_COLLECTION).updateOne({ urId }, {
                            $push: {
                                list: body.prId
                            }
                        })
                        resolve(response)

                    }

                } else {
                    let response = await db.get().collection(collection.CART_COLLECTION).insertOne({ urId, list: [body.prId] })
                    resolve(response)

                }

            } catch (error) {
                reject(error)
            }
        })
    },

    getCartCount: (urId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await db.get().collection(collection.CART_COLLECTION).findOne({ urId })
                if (result) {
                    resolve(result.list.length)
                } else {
                    let count = 0
                    resolve(count)
                }

            } catch (error) {
                reject(error)
            }
        })
    },

    getCartProduct: (urId) => {
        return new Promise(async (resolve, reject) => {
            try {

                let cartItem = await db.get().collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match: { urId: urId }
                    },
                    {
                        $unwind: "$list"
                    },
                    {
                        $project: {
                            item: "$list",
                            _id: false
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: 'prId',
                            as: 'cartItems'
                        }
                    },
                    {
                        $project: {
                            cartItems: { $arrayElemAt: ['$cartItems', 0] }
                        }
                    }



                ]).toArray()
                resolve(cartItem);
            } catch (error) {
                reject(error)
            }
        })
    },

    removeProductFromCart: (prId, urId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await db.get().collection(collection.CART_COLLECTION).updateOne({ urId }, {
                    $pull: {
                        list: prId
                    }
                })
                resolve(result)


            } catch (error) {
                reject(error)
            }
        })
    },

    checkGuestCart: (urId, token) => {
        return new Promise(async (resolve, reject) => {
            try {

                let result = await db.get().collection(collection.CART_COLLECTION).findOne({ urId })
                if (result) {
                    let tokenCart = await db.get().collection(collection.CART_COLLECTION).findOne({ urId: token })
                    await db.get().collection(collection.CART_COLLECTION).updateOne({ urId }, {
                        $addToSet: {
                            list: {
                                $each: tokenCart.list
                            }
                        }
                    })
                    await db.get().collection(collection.CART_COLLECTION).deleteOne({ urId: token })
                    resolve()


                } else {
                    await db.get().collection(collection.CART_COLLECTION).updateOne({ urId: token }, {
                        $set: {
                            urId: urId
                        }
                    })
                    resolve()

                }

            } catch (error) {
                reject(error)
            }
        })
    },
    // Cart End

    // CheckOut start
    changeCurrentAddress: (adId, urId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let response = await db.get().collection(collection.USER_COLLECTION).updateOne({ urId }, {
                    $set: {
                        currentAddress: adId
                    }
                })
                resolve(response)


            } catch (error) {
                reject(error)
            }
        })
    },
    checkCouponCode: (body) => {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await db.get().collection(collection.COUPON_COLLECTION).findOne({ cpCode: body.cpCode, used: false })
                if (result) {
                    // Check validity
                    var d = new Date();
                    let str = d.toJSON().slice(0, 10);
                    if (str >= result.validity) {
                        resolve({ expired: true })
                    } else {
                        resolve(result)
                    }
                } else {
                    resolve({ notAvailable: true })
                }


            } catch (error) {
                reject(error)
            }
        })
    },
    orderAccessing: (body, urId) => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(body, 'hii');
                let obj = {}
                // Create Random Id
                create_random_id(8)
                function create_random_id(sting_length) {
                    var randomString = '';
                    var numbers = '123456789ABCDEFGHJKLMNOPQRSTUVWXYZ'
                    for (var i, i = 0; i < sting_length; i++) {
                        randomString += numbers.charAt(Math.floor(Math.random() * numbers.length))
                    }
                    obj.orId = "OR_" + randomString
                }
                obj.urId = urId
                obj.methord = body.methord == 'payment=COD' ? 'COD' : "online"
                obj.amount = Number(body.amount)
                obj.status = obj.methord == "COD" ? "Placed" : "Pending"
                obj.date = new Date()
                obj.deliveryDate = new Date(new Date().getTime() + (5 * 24 * 60 * 60 * 1000))
                obj.products = []
                obj.address = null
                // Product
                if (body.prId) {
                    console.log('tobody');
                    obj.products.push(body.prId)
                } else {
                    console.log('outbody');
                    let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ urId })
                    obj.products = cart.list
                }
                // Address
                let address = await db.get().collection(collection.USER_COLLECTION).aggregate([
                    {
                        $match: {
                            urId
                        }
                    },
                    {
                        $project: {
                            urId: true,
                            addresses: {
                                $filter: {
                                    input: "$addresses",
                                    as: 'out',
                                    cond: {
                                        $eq: ['$$out.adId', "$currentAddress"]
                                    }
                                }
                            }

                        }
                    }

                ]).toArray()

                obj.address = address[0].addresses[0]

                let response = await db.get().collection(collection.ORDER_COLLECTION).insertOne(obj)
                response.methord = obj.methord
                response.products = obj.products
                response.orId = obj.orId
                response.amount = Number(obj.amount)
                response.name = obj.address.name

                response.phone = obj.address.phone

                resolve(response)

            } catch (error) {
                reject(error)
            }
        })
    },
    afterOreder: (product, urId, cpCode) => {
        return new Promise(async (resolve, reject) => {
            try {

                let products = []
                typeof product == 'string' ? products.push(product) : products = product
                for (let i = 0; i < products.length; i++) {
                    // change product Status
                    await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ prId: products[i] }, {
                        $set: {
                            status: "Ordered"
                        }
                    })
                    // Delete Cart
                    await db.get().collection(collection.CART_COLLECTION).updateOne({ urId }, {
                        $pull: {
                            list: products[i]
                        }
                    })
                }
                // Change Coupon Status
                await db.get().collection(collection.COUPON_COLLECTION).updateOne({ cpCode }, {
                    $set: {
                        used: true
                    }
                })

                resolve(urId)
            } catch (error) {
                reject(error)
            }

        })
    },
    // CheckOut End

    // Order Start
    getAllOrder: (urId) => {
        return new Promise(async (resolve, reject) => {
            try {

                let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match: {
                            urId
                        }
                    },
                    {
                        $unwind: "$products"
                    },
                    {
                        $project: {
                            orId: 1, urId: 1, status: 1, date: 1, deliveryDate: 1, products: 1, cancelDate: 1
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: "products",
                            foreignField: "prId",
                            as: 'productDetails'
                        }
                    },
                    {
                        $project: {
                            orId: 1, urId: 1, status: 1,
                            date: { $dateToString: { format: "%d-%m-%Y %H:%M:%S", date: "$date", timezone: "+05:30" } },
                            deliveryDate: { $dateToString: { format: "%d-%m-%Y ", date: "$deliveryDate", } },
                            cancelDate: { $dateToString: { format: "%d-%m-%Y ", date: "$cancelDate", } },
                            prId: { $first: '$productDetails.prId' },
                            title: { $first: '$productDetails.title' },
                            image: { $first: '$productDetails.image' },
                            size: { $first: '$productDetails.size' },
                            price: { $first: '$productDetails.price' },
                        }
                    }
                ]).sort({ date: -1 }).toArray()

                for (let i = 0; i < orders.length; i++) {
                    if (orders[i].status == "Cancelled") {
                        orders[i].message = "As per your requist, Your order has been " + orders[i].status
                        orders[i].cancelled = true
                    } else if (orders[i].status == "Pending") {
                        orders[i].message = "Your order has been " + orders[i].status + ', Pay now !'
                    } else {
                        orders[i].message = "Your order has been " + orders[i].status
                    }
                }

                resolve(orders.sort((a, b) => b - a))
            } catch (error) {
                reject(error)
            }
        })
    },
    getOneOrder: (urId, orId, prId) => {
        return new Promise(async (resolve, reject) => {
            try {

                let order = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match: {
                            orId
                        }
                    },
                    {
                        $project: {
                            countProduct: { $size: '$products' },
                            orId: 1, urId: 1, status: 1, amount: 1, methord: 1, address: 1,
                            date: 1, deliveryDate: 1, cancelDate: 1, status: 1, methord: 1,
                            products: 1
                        }
                    },
                    {
                        $unwind: "$products"
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: "products",
                            foreignField: "prId",
                            as: 'productDetails'
                        }
                    },
                    {
                        $project: {
                            orId: 1, urId: 1, status: 1, amount: 1, methord: 1, address: 1, countProduct: 1,
                            date: { $dateToString: { format: "%d-%m-%Y %H:%M:%S", date: "$date", timezone: "+05:30" } },
                            deliveryDate: { $dateToString: { format: "%d-%m-%Y ", date: "$deliveryDate", } },
                            cancelDate: { $dateToString: { format: "%d-%m-%Y ", date: "$cancelDate", } },
                            prId: { $first: '$productDetails.prId' },
                            title: { $first: '$productDetails.title' },
                            image: { $first: '$productDetails.image' },
                            size: { $first: '$productDetails.size' },
                            price: { $first: '$productDetails.price' },
                            category: { $first: '$productDetails.category' },
                            medium: { $first: '$productDetails.medium' },
                            description: { $first: '$productDetails.description' },
                            show: { $eq: [{ $first: '$productDetails.prId' }, prId] },
                            Placed: { $eq: ["$status", "Placed"] },
                            Pending: { $eq: ["$status", "Pending"] },
                            Shipped: { $eq: ["$status", "Shipped"] },
                            OutForDelivery: { $eq: ["$status", "OutForDelivery"] },
                            Delivered: { $eq: ["$status", "Delivered"] },
                            Cancelled: { $eq: ["$status", "Cancelled"] },
                            Online: { $eq: ['$methord', 'online'] },

                        }
                    }
                ]).toArray()
                resolve(order)

            } catch (error) {
                reject(error)
            }
        })
    },
    cancelOrder: (orId) => {
        return new Promise(async (resolve, reject) => {
            try {

                let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({ orId })
                if (order) {
                    for (let i = 0; i < order.products.length; i++) {
                        await db.get().collection(collection.PRODUCT_COLLECTION).updateMany({ prId: order.products[i] },
                            {
                                $set: {
                                    status: 'Approve'
                                }
                            })
                    }
                    let response = await db.get().collection(collection.ORDER_COLLECTION).updateOne({ orId }, {
                        $set: {
                            status: 'Cancelled',
                            cancelDate: new Date()
                        }
                    })
                    resolve(response)

                }

            } catch (error) {
                reject(error)
            }
        })
    },
    // Order End
    // Online Payment Start
    generateRazorpay: (orId, amount) => {

        return new Promise(async (resolve, reject) => {
            try {
                // Create Order
                instance.orders.create({
                    amount: amount * 100,
                    currency: "INR",
                    receipt: orId,

                }, (err, order) => {
                    if (err) {
                    } else {

                        resolve(order)
                    }
                })

            } catch (error) {
                reject(error)
            }
        })
    },
    verifyPayment: (details) => {
        return new Promise(async (resolve, reject) => {
            try {
                const crypto = require('crypto');
                let hmac = crypto.createHmac('sha256', 'rEbNwpcSpVyBYMnDxcAauA6W')
                hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
                hmac = hmac.digest('hex')
                if (hmac == details['payment[razorpay_signature]']) {
                    resolve()
                } else {
                    reject()
                }

            } catch (error) {
                reject(error)
            }
        })
    },
    changePaymentStatus: (body) => {
        return new Promise(async (resolve, reject) => {
            try {
                db.get().collection(collection.ORDER_COLLECTION).updateOne({ orId: body['order[receipt]'] }, {
                    $set: {
                        status: 'Placed'
                    }
                })
                resolve()


            } catch (error) {
                reject(error)
            }
        })
    },
    savePaymentDetails: (body) => {
        return new Promise(async (resolve, reject) => {
            try {
                let obj = {
                    razorpayPaymentId: body['payment[razorpay_payment_id]'],
                    razorpayOrderId: body['payment[razorpay_order_id]'],
                    razorpaySignature: body['payment[razorpay_signature]'],
                    orderId: body['order[id]'],
                    orderAmount: body['order[amount]'],
                    orderAmountPaid: body['order[amount_paid]'],
                    orderAmountDue: body['order[amount_due]'],
                    orderCurrency: body['order[currency]'],
                    orderReceipt: body['order[receipt]'],
                    orderUrId: body['order[urId]'],
                }
                await db.get().collection(collection.PAYMENT_COLLECTION).insertOne(obj)
                resolve()


            } catch (error) {
                reject(error)
            }
        })
    },
    // Online Payment End

    // Wishlist Start
    wishProduct: (prId, urId) => {
        return new Promise(async (resolve, reject) => {
            try {

                let result = await db.get().collection(collection.USER_COLLECTION).findOne({ urId, wishlist: { $in: [prId] } })
                if (result) {
                    await db.get().collection(collection.USER_COLLECTION).updateOne({ urId }, {
                        $pull: {
                            wishlist: prId
                        }
                    })
                    await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ prId }, {
                        $inc: {
                            wishCount: -1
                        }
                    })
                    resolve({ status: false })


                } else {
                    await db.get().collection(collection.USER_COLLECTION).updateOne({ urId }, {
                        $push: {
                            wishlist: prId
                        }
                    })
                    await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ prId }, {
                        $inc: {
                            wishCount: 1
                        }
                    })
                    resolve({ status: true })


                }

            } catch (error) {
                reject(error)
            }
        })
    },
    getAllWishlist: (urId) => {
        return new Promise(async (resolve, reject) => {
            try {

                let wishlist = await db.get().collection(collection.USER_COLLECTION).aggregate([
                    {
                        $match: {
                            urId
                        }
                    },
                    {
                        $project: {
                            wishlist: 1, _id: 0
                        }
                    },
                    {
                        $unwind: '$wishlist'
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'wishlist',
                            foreignField: 'prId',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            title: { $first: '$product.title' },
                            size: { $first: '$product.size' },
                            price: { $first: '$product.price' },
                            image: { $first: '$product.image' },
                            prId: { $first: '$product.prId' },
                            category: { $first: '$product.category' },
                            medium: { $first: '$product.medium' },
                            quality: { $first: '$product.qulity' },
                            ogPrice: { $first: '$product.ogPrice' },
                            percentage: { $first: '$product.percentage' },
                            wishCount: { $first: '$product.wishCount' },
                        }
                    }
                ]).toArray()
                resolve(wishlist)

            } catch (error) {
                reject(error)
            }
        })
    }
    // Wishlist End


}