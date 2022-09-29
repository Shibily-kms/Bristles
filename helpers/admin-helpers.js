const db = require('../config/connection')
const collection = require('../config/collection');
const ObjectId = require('mongodb').ObjectId;


module.exports = {
    // Sign Start
    doSignIn: (body) => {
        return new Promise(async (resolve, reject) => {
            try {
                let adminData = {
                    username: "Bristles",
                    email: "admin@gmail.com",
                    password: '123',
                }
                if (adminData.email == body.email) {
                    if (adminData.password == body.password) {
                        resolve(adminData)
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
    // Sign End

    // Category Start
    addCategory: (body) => {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ title: body.title })
                if (result) {
                    resolve({ nameError: true })
                } else {
                    // Create Random Id
                    create_random_id(4)
                    function create_random_id(sting_length) {
                        var randomString = '';
                        var numbers = '123456789'
                        for (var i, i = 0; i < sting_length; i++) {
                            randomString += numbers.charAt(Math.floor(Math.random() * numbers.length))
                        }
                        body.cgId = "CG" + randomString
                    }
                    let result = await db.get().collection(collection.CATEGORY_COLLECTION).insertOne(body)
                    resolve(result)
                }
            } catch (error) {
                reject(error)
            }
        })
    },

    getAllCategory: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
                resolve(result)

            } catch (error) {
                reject(error)
            }
        })
    },

    getOneCategroy: (id) => {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ cgId: id })
                resolve(result)

            } catch (error) {
                reject(error)
            }
        })
    },

    editCategory: (body, id) => {
        return new Promise(async (resolve, reject) => {
            try {
                let check = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ title: body.title })
                if (!check || check.cgId == id) {
                    let result = await db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ cgId: id }, {
                        $set: {
                            title: body.title
                        }
                    })
                    resolve(result)

                } else {
                    resolve({ nameError: true })
                }

            } catch (error) {
                reject(error)
            }
        })
    },

    deleteCategory: (id) => {
        return new Promise(async (resolve, reject) => {
            try {
                db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ cgId: id })
                resolve()
            } catch (error) {
                reject(error)
            }
        })
    },
    // Category End

    // Product Start
    addProduct: (body) => {
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
                    body.prId = "PR" + randomString
                    body.delete = false,
                        body.status = 'Approve'
                }
                body.percentage = null
                if (body.ogPrice) {
                    body.percentage = 100 - (Math.round((body.price / body.ogPrice) * 100))
                }
                db.get().collection(collection.PRODUCT_COLLECTION).insertOne(body)
                resolve()

            } catch (error) {
                reject(error)
            }


        })
    },

    getAllCatProduct: (CAT, urId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: CAT, status: { $in: ['Approve'] }, delete: false }).toArray()
                resolve(result)
            } catch (error) {
                reject(error)
            }
        })
    },

    getOneProduct: (proId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ prId: proId })
                if (result.arId) {
                    let artist = await db.get().collection(collection.ARTIST_COLLECTION).findOne({ arId: result.arId })
                    let artistDetails = {
                        arId: artist.arId,
                        email: artist.email,
                        name: artist.userName,
                        image: artist.image,
                        rate: artist.rate,
                        rateCount: artist.rateCount,
                        image: artist.image,
                    }
                    result.artist = artistDetails
                }

                if (result.status == "Rejected") {
                    result.reject = true
                } else if (result.status == "Approve") {
                    result.status = "In"
                } else if (result.status == "Ordered") {
                    result.status = 'Out'
                }
                resolve(result)

            } catch (error) {
                console.log('errorFirst');
                reject(error)
            }
        })
    },

    editProduct: (body) => {
        return new Promise(async (resolve, reject) => {
            try {

                let images = null

                let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ prId: body.prId })
                if (body.image.length == 0) {
                    body.image = product.image
                } else {
                    images = product.image
                }
                let percentage = false
                if (body.ogPrice) {
                    percentage = 100 - (Math.round((body.price / body.ogPrice) * 100))
                }

                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ prId: body.prId }, {
                    $set: {
                        title: body.title,
                        size: body.size,
                        medium: body.medium,
                        surface: body.surface,
                        quality: body.quality,
                        image: body.image,
                        price: parseInt(body.price),
                        ogPrice: parseInt(body.ogPrice),
                        percentage
                    }
                })
                resolve(images)


            } catch (error) {
                reject(error)
            }

        })
    },

    deleteProduct: (prId) => {
        return new Promise(async (resolve, reject) => {
            try {
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ prId }, {
                    $set: {
                        delete: true
                    }
                })
                resolve()


            } catch (error) {
                reject(error)
            }
        })
    },
    // Product End

    // User Start
    getAllUser: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let user = await db.get().collection(collection.USER_COLLECTION).find().toArray()
                for (let i = 0; i < user.length; i++) {
                    if (user[i].status == "Active") {
                        user[i].active = true
                    } else if (user[i].status == "Blocked") {
                        user[i].blocked = true
                    }
                }
                resolve(user)


            } catch (error) {
                reject(error)
            }
        })
    },
    activeAndBlockUser: (urId, status) => {
        return new Promise(async (resolve, reject) => {
            try {

                if (status == "blocked") {
                    db.get().collection(collection.USER_COLLECTION).updateOne({ urId }, {
                        $set: {
                            status: "Blocked"
                        }
                    })
                    resolve({ message: "User account Blocked" })

                } else if (status == "active") {
                    db.get().collection(collection.USER_COLLECTION).updateOne({ urId }, {
                        $set: {
                            status: "Active"
                        }
                    })
                    resolve({ message: "User account Actived" })

                }
            } catch (error) {
                reject(error)
            }
        })
    },
    getOneUserOrder: (urId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let order = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match: {
                            urId
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
                            orId: 1, urId: 1, methord: 1, amount: 1, status: 1,
                            date: { $dateToString: { format: "%d-%m-%Y ", date: "$date", } },
                            firstName: { $first: '$user.firstName' },
                            lastName: { $first: '$user.lastName' },
                            image: { $first: '$user.image' }
                        }
                    }

                ]).sort({_id:-1}).toArray()
                resolve(order)
            } catch (error) {
                reject (error)
            }
        })
    },
    // User End

    // Artist Start
    getAllPendingArtist: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let artist = await db.get().collection(collection.ARTIST_COLLECTION).find({ status: { $in: ["Pending", "Rejected"] } }).toArray()
                for (let i = 0; i < artist.length; i++) {
                    if (artist[i].status == "Pending") {
                        artist[i].pending = true
                    } else if (artist[i].status == "Rejected") {
                        artist[i].rejected = true
                    }
                }
                resolve(artist)


            } catch (error) {
                reject(error)
            }
        })
    },

    getAllArtist: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let artist = await db.get().collection(collection.ARTIST_COLLECTION).find({ status: { $in: ["Active", "Blocked"] } }).toArray()
                for (let i = 0; i < artist.length; i++) {
                    if (artist[i].status == "Active") {
                        artist[i].active = true
                    } else if (artist[i].status == "Blocked") {
                        artist[i].blocked = true
                    }
                }
                resolve(artist)


            } catch (error) {
                reject(error)
            }
        })
    },

    approveArtist: (arId) => {
        return new Promise(async (resolve, reject) => {
            try {
                db.get().collection(collection.ARTIST_COLLECTION).updateOne({ arId }, {
                    $set: {
                        status: "Active"
                    }
                })
                resolve()


            } catch (error) {
                reject(error)
            }
        })
    },

    rejectArtist: (arId) => {
        return new Promise(async (resolve, reject) => {
            try {
                db.get().collection(collection.ARTIST_COLLECTION).updateOne({ arId }, {
                    $set: {
                        status: "Rejected"
                    }
                })
                resolve()


            } catch (error) {
                reject(error)
            }
        })
    },
    activeAndBlockArtist: (arId, status) => {
        return new Promise(async (resolve, reject) => {
            try {

                if (status == "blocked") {
                    db.get().collection(collection.ARTIST_COLLECTION).updateOne({ arId }, {
                        $set: {
                            status: "Blocked"
                        }
                    })
                    resolve({ message: "Artist account Blocked" })

                } else if (status == "active") {
                    db.get().collection(collection.ARTIST_COLLECTION).updateOne({ arId }, {
                        $set: {
                            status: "Active"
                        }
                    })
                    resolve({ message: "Artist account Actived" })

                }
            } catch (error) {
                reject(error)
            }
        })
    },

    // Artist End

    // Pending Products Start
    getAllCatPending: (CAT) => {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: CAT, status: { $in: ['Pending', 'Rejected'] }, delete: false }).toArray()
                for (let i = 0; i < result.length; i++) {
                    if (result[i].status == "Pending") {
                        result[i].Pending = true
                    }
                }
                resolve(result)


            } catch (error) {
                reject(error)
            }
        })
    },

    approveAndRejectProduct: (prId, option) => {
        return new Promise(async (resolve, reject) => {
            try {
                if (option == "approve") {
                    db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ prId }, {
                        $set: {
                            status: "Approve"
                        }
                    })
                    resolve({ approve: true })

                } else if (option == "reject") {
                    db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ prId }, {
                        $set: {
                            status: "Rejected"
                        }
                    })
                    resolve({ reject: true })

                }

            } catch (error) {
                reject(error)
            }

        })
    },

    // Pending Products End

    // Carousel Start
    getCarousel: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await db.get().collection(collection.CAROUSEL_COLLECTION).find().toArray()
                resolve(result)
            } catch (error) {
                reject(error)
            }
        })
    },

    addCarousel: (body) => {
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
                    body.crId = "CR" + randomString
                }
                db.get().collection(collection.CAROUSEL_COLLECTION).insertOne(body)
                resolve()


            } catch (error) {
                reject(error)
            }
        })
    },

    deleteCarousel: (crId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let image = null
                let result = await db.get().collection(collection.CAROUSEL_COLLECTION).findOne({ crId })
                if (result) {
                    image = result.image
                    db.get().collection(collection.CAROUSEL_COLLECTION).deleteOne({ crId })
                    resolve(image)

                }


            } catch (error) {
                reject(error)
            }
        })
    },
    // Carousel End

    // Coupon Start
    getAllCoupon: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let coupon = await db.get().collection(collection.COUPON_COLLECTION).find({ used: false }).toArray()
                resolve(coupon)


            } catch (error) {
                reject(error)
            }
        })
    },
    addCoupon: (body) => {
        return new Promise(async (resolve, reject) => {
            try {
                create_random_id(8)
                function create_random_id(sting_length) {
                    var randomString = '';
                    var numbers = '123456789ABCDEFGHLJKLMNPQRSTUVWXYZ'
                    for (var i, i = 0; i < sting_length; i++) {
                        randomString += numbers.charAt(Math.floor(Math.random() * numbers.length))
                    }
                    body.cpCode = randomString
                    body.used = false
                    body.value = Number(body.value)
                }
                db.get().collection(collection.COUPON_COLLECTION).insertOne(body)
                resolve()


            } catch (error) {
                reject(error)
            }
        })
    },
    getOneCoupon: (cpCode) => {
        return new Promise(async (resolve, reject) => {
            try {
                let coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({ cpCode })
                resolve(coupon)


            } catch (error) {
                reject(error)
            }
        })
    },
    editCoupon: (body) => {
        return new Promise(async (resolve, reject) => {
            try {
                db.get().collection(collection.COUPON_COLLECTION).updateOne({ cpCode: body.cpCode }, {
                    $set: {
                        value: body.value,
                        validity: body.validity
                    }
                })
                resolve()


            } catch (error) {
                reject(error)
            }
        })
    },
    deleteCoupon: (cpCode) => {
        return new Promise(async (resolve, reject) => {
            try {
                db.get().collection(collection.COUPON_COLLECTION).deleteOne({ cpCode })
                resolve()


            } catch (error) {
                reject(error)
            }
        })
    },
    // Coupon End

    // Order Start
    getAllOrder: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let order = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $project: {
                            orId: 1, urId: 1, methord: 1, amount: 1, status: 1,
                            date: { $dateToString: { format: "%d-%m-%Y", date: "$date", timezone: "+05:30" } },
                        }
                    }
                ]).sort({ date: -1 }).toArray()
                resolve(order)


            } catch (error) {
                reject(error)
            }
        })
    },
    getOneOrder: (orId) => {
        return new Promise(async (resolve, reject) => {
            try {

                let order = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match: {
                            orId
                        }
                    },
                    {
                        $lookup: {
                            from: collection.USER_COLLECTION,
                            localField: "urId",
                            foreignField: "urId",
                            as: 'user'
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
                            orId: 1, urId: 1, status: 1, amount: 1, methord: 1, address: 1,
                            date: { $dateToString: { format: "%d-%m-%Y %H:%M:%S", date: "$date", timezone: "+05:30" } },
                            deliveryDate: { $dateToString: { format: "%d-%m-%Y ", date: "$deliveryDate", } },
                            cancelDate: { $dateToString: { format: "%d-%m-%Y ", date: "$cancelDate", } },
                            prId: { $first: '$productDetails.prId' },
                            title: { $first: '$productDetails.title' },
                            prImage: { $first: '$productDetails.image' },
                            size: { $first: '$productDetails.size' },
                            price: { $first: '$productDetails.price' },
                            category: { $first: '$productDetails.category' },
                            medium: { $first: '$productDetails.medium' },
                            description: { $first: '$productDetails.description' },
                            Placed: { $eq: ["$status", "Placed"] },
                            Pending: { $eq: ["$status", "Pending"] },
                            Shipped: { $eq: ["$status", "Shipped"] },
                            OutForDelivery: { $eq: ["$status", "OutForDelivery"] },
                            Delivered: { $eq: ["$status", "Delivered"] },
                            Cancelled: { $eq: ["$status", "Cancelled"] },
                            firstName: { $first: '$user.firstName' },
                            lastName: { $first: '$user.lastName' },
                            email: { $first: '$user.email' },
                            Online: { $eq: ['$methord', 'online'] }
                        }
                    }
                ]).toArray()
                order[0].length = typeof order == "object" ? order.length : 0
                resolve(order)

            } catch (error) {
                reject(error)
            }
        })
    },
    changeOrderStatus: (body) => {
        return new Promise(async (resolve, reject) => {
            try {
                let response = await db.get().collection(collection.ORDER_COLLECTION).updateOne({ orId: body.orId }, {
                    $set: {
                        status: body.status
                    }
                })
                resolve(response)


            } catch (error) {
                reject(error)
            }
        })
    },
    // Order End

    // Payment Start
    getOnePaymentDetails: (orId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let details = await db.get().collection(collection.PAYMENT_COLLECTION).findOne({ orderReceipt: orId })
                if (details) {
                    details.orderAmount = parseInt(details.orderAmount) / 100
                    details.orderAmountPaid = details.orderAmountPaid == '0' ? 0 : parseInt(details.orderAmountPaid) / 100
                    details.orderAmountDue = parseInt(details.orderAmountDue) / 100
                }
                resolve(details)


            } catch (error) {
                reject(error)
            }
        })
    }
    // Payment End








}