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

    // Dashboard Start
    getDashboardCountObj: () => {
        return new Promise(async (resolve, reject) => {
            try {

                let today = new Date()
                let todayYMD = new Date().toLocaleDateString('en-CA')

                let before = new Date(new Date().getTime() - (30 * 24 * 60 * 60 * 1000))
                let paymentLastMonth = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match: {
                            status: 'Delivered',
                            deliveryDate: {
                                $gte: before,
                                $lte: today
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            Amount: { $sum: '$amount' }
                        }
                    }
                ]).toArray()
                let productsCount = await db.get().collection(collection.PRODUCT_COLLECTION).find({ status: 'Approve', delete: false }).count()
                let orderCount = await db.get().collection(collection.ORDER_COLLECTION).find({ status: { $in: ['Placed', 'Pending', 'Shipped', 'OutForDelivery'] } }).count()
                let artistCount = await db.get().collection(collection.ARTIST_COLLECTION).find({ status: { $in: ['Active', 'Blocked'] } }).count()
                let userCount = await db.get().collection(collection.USER_COLLECTION).find().count()
                let pendingProductCount = await db.get().collection(collection.PRODUCT_COLLECTION).find({ status: 'Pending' }).count()
                let categoryCount = await db.get().collection(collection.CATEGORY_COLLECTION).find().count()
                let couponCount = await db.get().collection(collection.COUPON_COLLECTION).find({ used: false, validity: { $gte: todayYMD } }).count()

                let orderStatusBasieCount = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $project: {
                            status: 1
                        }
                    },
                    {
                        $group: {
                            _id: { status: '$status' },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            status: '$_id.status',
                            count: 1,
                            _id: 0
                        }
                    }
                ]).toArray()
                let a = [0, 0, 0, 0, 0, 0]
                for (let i = 0; i < orderStatusBasieCount.length; i++) {
                    if (orderStatusBasieCount[i].status == "Delivered") {
                        a[0] = orderStatusBasieCount[i].count
                    } else if (orderStatusBasieCount[i].status == "OutForDelivery") {
                        a[1] = orderStatusBasieCount[i].count
                    } else if (orderStatusBasieCount[i].status == "Shipped") {
                        a[2] = orderStatusBasieCount[i].count
                    } else if (orderStatusBasieCount[i].status == "Placed") {
                        a[3] = orderStatusBasieCount[i].count
                    } else if (orderStatusBasieCount[i].status == "Pending") {
                        a[4] = orderStatusBasieCount[i].count
                    } else if (orderStatusBasieCount[i].status == "Cancelled") {
                        a[5] = orderStatusBasieCount[i].count
                    }
                }
                orderStatusBasieCount = a
                let top4Category = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                    {
                        $match: {
                            status: "Approve", delete: false
                        }
                    },

                    {
                        $project: {
                            category: 1,
                        }
                    },
                    {
                        $group: {
                            _id: { category: '$category' },
                            myCount: { $sum: 1 },

                        }
                    },
                    {
                        $project: {
                            category: '$_id.category',
                            count: '$myCount',
                            _id: 0,
                        }
                    }
                ]).sort({ count: -1 }).limit(4).toArray()


                // Zero Handiling
                let lastMonthAmount = paymentLastMonth[0] == undefined ? 0 : paymentLastMonth[0].Amount


                let obj = {
                    lastMonthAmount,
                    productsCount,
                    orderCount,
                    artistCount,
                    userCount,
                    pendingProductCount,
                    categoryCount, couponCount, top4Category,
                    orderStatusBasieCount
                }

                resolve(obj)

            } catch (error) {
                reject(error)
            }
        })
    },
    getTotalRevenueList: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let today = new Date()
                let before = new Date(new Date().getTime() - (250 * 24 * 60 * 60 * 1000))

                let revenue = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match: {
                            status: 'Delivered',
                            deliveryDate: {
                                $gte: before,
                                $lte: today
                            }
                        }
                    },
                    {
                        $project: {
                            methord: 1, amount: 1, deliveryDate: 1
                        }
                    },
                    {
                        $group: {
                            _id: { date: { $dateToString: { format: "%m-%Y", date: "$deliveryDate" } }, methord: '$methord' },
                            Amount: { $sum: '$amount' }
                        }
                    },
                    {
                        $project: {
                            date: '$_id.date',
                            methord: '$_id.methord',
                            amount: '$Amount',
                            _id: 0
                        }
                    }
                ]).sort({ date: 1 }).toArray()

                let obj = {
                    date: [], cod: [0, 0, 0, 0, 0, 0, 0, 0], online: [0, 0, 0, 0, 0, 0, 0, 0]
                }
                let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                let a = today.getMonth() - 6
                for (let i = 0; i < 8; i++) {
                    for (let k = 0; k < revenue.length; k++) {
                        if (Number(revenue[k].date.slice(0, 2)) == Number(a + i)) {
                            if (revenue[k].methord == 'online') {
                                obj.online[i] = revenue[k].amount
                            } else {
                                obj.cod[i] = revenue[k].amount
                            }
                        }
                    }
                    obj.date[i] = month[a + i - 1]
                }
                resolve(obj)

            } catch (error) {
                reject(error)
            }
        })
    },
    getOrderMethodChart: () => {

        return new Promise(async (resolve, reject) => {
            try {
                let today = new Date()
                let before = new Date(new Date().getTime() - (190 * 24 * 60 * 60 * 1000))

                let order = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match: {
                            status: 'Delivered',
                            deliveryDate: {
                                $gte: before,
                                $lte: today
                            }
                        }
                    },
                    {
                        $project: {
                            methord: 1, amount: 1, deliveryDate: 1
                        }
                    },
                    {
                        $group: {
                            _id: { date: { $dateToString: { format: "%m-%Y", date: "$deliveryDate" } }, method: '$methord' },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            date: '$_id.date',
                            method: '$_id.method',
                            count: '$count',
                            _id: 0
                        }
                    }
                ]).sort({ date: 1 }).toArray()

                let obj = {
                    date: [], cod: [0, 0, 0, 0, 0, 0, 0], online: [0, 0, 0, 0, 0, 0, 0]
                }
                let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                let a = today.getMonth() - 5
                let large = 0
                for (let i = 0; i < 7; i++) {
                    for (let k = 0; k < order.length; k++) {
                        if (Number(order[k].date.slice(0, 2)) == Number(a + i)) {
                            if (order[k].method == 'online') {
                                obj.online[i] = order[k].count
                            } else {
                                obj.cod[i] = order[k].count
                            }
                            if (order[k].count > large) {
                                large = order[k].count
                            }
                        }
                    }
                    obj.date[i] = month[a + i - 1]
                }
                obj.large = large + 2

                resolve(obj)
            } catch (error) {
                reject(error)
            }
        })
    },
    getCategoryChart: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let categoryList = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                    {
                        $match: {
                            status: "Approve", delete: false
                        }
                    },

                    {
                        $project: {
                            category: 1,
                        }
                    },
                    {
                        $group: {
                            _id: { category: '$category' },
                            myCount: { $sum: 1 },

                        }
                    },
                    {
                        $project: {
                            category: '$_id.category',
                            count: '$myCount',
                            _id: 0,
                        }
                    }
                ]).sort({ count: -1 }).toArray()
                categoryList = categoryList[0] == undefined ? [{ category: 0, count: 0 }] : categoryList
                let sum = 0
                let obj = {
                    category: [], count: []
                }
                for (let i = 0; i < 4; i++) {
                    sum = sum + categoryList[i].count
                }

                for (let i = 0; i < 4; i++) {
                    obj.category[i] = categoryList[i].category
                    obj.count[i] = categoryList[i].count
                }
                obj.sum = sum

                resolve(obj)

            } catch (error) {
                reject(error)
            }
        })
    },
    getDeliveryChart: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let today = new Date()
                let before = new Date(new Date().getTime() - (190 * 24 * 60 * 60 * 1000))

                let orderCount = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match: {
                            status: 'Delivered',
                            deliveryDate: {
                                $gte: before,
                                $lte: today
                            }
                        }
                    },
                    {
                        $project: {
                            deliveryDate: 1, status: 1
                        }
                    },
                    {
                        $group: {
                            _id: { date: { $dateToString: { format: "%m-%Y", date: "$deliveryDate" } } },
                            myCount: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            date: '$_id.date',
                            count: '$myCount',
                            status: '$_id.status',
                            _id: 0
                        }
                    }
                ]).sort({ date: 1 }).toArray()
                let obj = {
                    date: [], count: [0, 0, 0, 0, 0, 0]
                }
                let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                let a = today.getMonth() - 4
                let sum = 0
                for (let i = 0; i < 6; i++) {
                    for (let k = 0; k < orderCount.length; k++) {
                        if (Number(orderCount[k].date.slice(0, 2)) == Number(a + i)) {
                            obj.count[i] = orderCount[k].count
                            sum = sum + orderCount[k].count
                        }
                    }
                    obj.date[i] = month[a + i - 1]
                }
                obj.sum = sum
                resolve(obj)

            } catch (error) {
                reject(error)
            }
        })
    },
    // Dashboard End

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
                    result.OutStoke = true
                }
                resolve(result)

            } catch (error) {

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

                ]).sort({ _id: -1 }).toArray()
                resolve(order)
            } catch (error) {
                reject(error)
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
                ]).sort({ _id: -1 }).toArray()
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
                let response = ''
                if (body.status == 'Delivered') {
                    response = await db.get().collection(collection.ORDER_COLLECTION).updateOne({ orId: body.orId }, {
                        $set: {
                            status: body.status,
                            deliveryDate: new Date()
                        }
                    })
                } else {
                    response = await db.get().collection(collection.ORDER_COLLECTION).updateOne({ orId: body.orId }, {
                        $set: {
                            status: body.status
                        }
                    })
                }
                resolve(response)


            } catch (error) {
                reject(error)
            }
        })
    },
    getOneOrderForXL: (orId) => {
        return new Promise(async (resolve, reject) => {
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
                        _id:0,
                        ORDER_ID: '$orId',
                        USER_ID: '$urId',
                        NAME: { $first: '$user.userName' },
                        EMAIL: { $first: '$user.email' },
                        METHOD: '$method',
                        TOTAL_AMOUNT: '$amount',
                        STATUS: '$status',
                        DATE: { $dateToString: { format: "%d-%m-%Y %H:%M:%S", date: "$date", timezone: "+05:30" } },
                        PRODUCT_ID: { $first: '$productDetails.prId' },
                        PRODUCT_TITLE: { $first: '$productDetails.title' },
                        CATEGORY: { $first: '$productDetails.category' },
                        SIZE: { $first: '$productDetails.size' },
                        MEDIUM: { $first: '$productDetails.medium' },
                        PRODUCT_PRICE: { $first: '$productDetails.price' },
                        DELIVERY_DATE: { $dateToString: { format: "%d-%m-%Y %H:%M:%S ", date: "$deliveryDate", } },
                        CANCEL_DATE: { $dateToString: { format: "%d-%m-%Y %H:%M:%S ", date: "$cancelDate", } },
                        ARTIST_ID: { $first: '$productDetails.arId' },
                    }
                }
            ]).toArray()
            resolve(order)
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