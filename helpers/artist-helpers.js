const db = require('../config/connection')
const collection = require('../config/collection')
const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const help = require('../helpers/help-fuctions')

module.exports = {
    // Sign Start
    verifyEmail: (email) => {
        return new Promise(async (resolve, reject) => {
            try {
                let response = await db.get().collection(collection.ARTIST_COLLECTION).findOne({ email })
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
                    body.arId = "AR" + randomString
                }
                body.status = "Pending"
                body.password = await bcrypt.hash(body.password, 10)
                let result = await db.get().collection(collection.ARTIST_COLLECTION).insertOne(body)
                resolve(result)


            } catch (error) {
                reject(error)
            }
        })
    },

    doSignIn: (body) => {
        return new Promise(async (resolve, reject) => {
            try {

                let data = await db.get().collection(collection.ARTIST_COLLECTION).findOne({ email: body.email, status: "Active" })
                if (data) {
                    let status = await bcrypt.compare(body.password, data.password)
                    if (status) {
                        delete data.password;
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

    setNewPassword: (body, arId) => {
        return new Promise(async (resolve, reject) => {
            try {
                body.password = await bcrypt.hash(body.password, 10)
                let result = await db.get().collection(collection.ARTIST_COLLECTION).updateOne({ arId }, {
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

    checkAccountActivation: (CHECK_ID) => {
        return new Promise(async (resolve, reject) => {
            try {

                let result = await db.get().collection(collection.ARTIST_COLLECTION).findOne({ _id: ObjectId(CHECK_ID) })
                if (result.status == "Active") {
                    resolve({ Active: true })
                } else if (result.status == "Pending") {
                    resolve({ NotActivated: true })
                } else if (result.status == "Rejected") {
                    resolve({ Rejected: true })
                }

            } catch (error) {
                reject(error)
            }
        })
    },
    checkAccountActive: (arId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await db.get().collection(collection.ARTIST_COLLECTION).findOne({ arId, status: "Active" })
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

    // DashBoard Start
    getTotalRevenueChart: (arId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let today = new Date()
                let before = new Date(new Date().getTime() - (190 * 24 * 60 * 60 * 1000))

                let revenue = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                    {
                        $match: {
                            arId: arId, status: 'Ordered'
                        }
                    },
                    {
                        $project: {
                            arId: 1, prId: 1, price: 1
                        }
                    },
                    {
                        $lookup: {
                            from: collection.ORDER_COLLECTION,
                            let: { 'proId': '$prId' },
                            pipeline: [
                                {
                                    '$match': {
                                        '$expr': {
                                            '$in': ['$$proId', '$products.prId']
                                        }
                                    }
                                }
                            ],
                            as: 'order'
                        }
                    },
                    {
                        $project: {
                            prId: 1, price: 1,
                            date: { $dateToString: { format: "%m-%Y", date: { $first: '$order.date' } } }
                        }
                    }
                ]).toArray()

                let obj = {
                    date: [], amount: [0, 0, 0, 0, 0, 0, 0], count: [0, 0, 0, 0, 0, 0, 0]
                }
                let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                let large = 0

                let a = today.getMonth() - 5
                for (let i = 0; i < 7; i++) {
                    for (let k = 0; k < revenue.length; k++) {
                        if (Number(revenue[k].date.slice(0, 2)) == Number(a + i)) {
                            obj.amount[i] = obj.amount[i] + revenue[k].price
                            obj.count[i] = obj.count[i] + 1
                        }
                        if (obj.amount[i] > large) {
                            large = obj.amount[i]
                        }

                    }
                    obj.date[i] = month[a + i - 1]
                }
                obj.large = large + 10

                resolve(obj);
            } catch (error) {
                reject(error)
            }
        })
    },
    getDashboardDetails: (arId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let totalPayment = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                    {
                        $match: {
                            arId: arId, status: 'Ordered',
                        }

                    },
                    {
                        $group: {
                            _id: null,
                            count: { $sum: 1 },
                            amount: { $sum: '$price' }
                        }
                    }
                ]).toArray()
                totalPayment = totalPayment[0] == undefined ? { count: 0, amount: 0 } : totalPayment[0]

                let totalProducts = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                    {
                        $match: {
                            arId: arId, status: {
                                $in: ['Approve', 'Pending']
                            }
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
                            count: '$count',
                            _id: 0
                        }
                    }
                ]).toArray()
                let pending = 0
                let approve = 0
                for (let i = 0; i < totalProducts.length; i++) {
                    if (totalProducts[i].status == "Pending") {
                        pending = totalProducts[i].count
                    } else {
                        approve = totalProducts[i].count
                    }

                }


                let obj = {
                    totalPayment,
                    productCount: {
                        pending, approve
                    },
                    totalProducts: approve + totalPayment.count
                }

                resolve(obj)
            } catch (error) {
                reject(error)
            }
        })
    },
    get4TopCategory: (arId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let topCategory = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                    {
                        $match: {
                            arId: arId,
                            status: {
                                $in: ['Approve', 'Ordered']
                            }
                        }
                    },
                    {
                        $group: {
                            _id: { category: '$category' },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            category: '$_id.category',
                            count: '$count',
                            _id: 0
                        }
                    }
                ]).sort({ count: -1 }).limit(4).toArray()
                let obj = {
                    category: [], count: []
                }
                for (let i = 0; i < topCategory.length; i++) {
                    obj.category[i] = topCategory[i].category
                    obj.count[i] = topCategory[i].count
                }
                resolve(obj);
            } catch (error) {
                reject(error)
            }
        })
    },
    // DashBoard End

    // Artist About Start
    getArtist: (arId) => {
        return new Promise(async (resolve, reject) => {
            try {

                let result = await db.get().collection(collection.ARTIST_COLLECTION).findOne({ arId })

                if (result) {
                    if (result.status == "Pending") {
                        result.pending = true
                    } else if (result.status == "Active") {
                        result.active = true
                    } else if (result.status == "Rejected") {
                        result.rejected = true
                    } else if (result.status == "Blocked") {
                        result.blocked = true
                    }
                    resolve(result)
                } else {
                    resolve({ exception: true })
                }

            } catch (error) {
                reject(error)
            }
        })
    },

    editProfile: (body) => {
        return new Promise(async (resolve, reject) => {
            try {

                let image = null
                let artist = await db.get().collection(collection.ARTIST_COLLECTION).findOne({ arId: body.arId })
                if (body.image == null) {
                    body.image = artist.image
                } else {
                    image = artist.image
                }
                let obj = {
                    name: body.name,
                    phone: body.phone,
                    pincode: body.pincode,
                    locality: body.locality,
                    area: body.area,
                    city: body.city,
                    state: body.state,
                    landmark: body.landmark
                }
                db.get().collection(collection.ARTIST_COLLECTION).updateOne({ arId: body.arId }, {
                    $set: {
                        firstName: body.firstName,
                        lastName: body.lastName,
                        userName: body.userName,
                        mobile: body.mobile,
                        place: body.place,
                        address: obj,
                        image: body.image
                    }
                })
                let obj2 = {
                    firstName: body.firstName,
                    lastName: body.lastName,
                    userName: body.userName,
                    email: artist.email,
                    mobile: body.mobile,
                    place: body.place,
                    image: body.image,
                    arId: artist.arId,
                    deleteImage: image
                }
                resolve(obj2)


            } catch (error) {
                reject(error)
            }

        })
    },

    changePassword: (body) => {

        return new Promise(async (resolve, reject) => {
            try {

                let artist = await db.get().collection(collection.ARTIST_COLLECTION).findOne({ arId: body.arId })
                if (artist) {
                    let status = await bcrypt.compare(body.currentPassword, artist.password)
                    if (status) {
                        let newPass = await bcrypt.hash(body.newPassword, 10)
                        let response = await db.get().collection(collection.ARTIST_COLLECTION).updateOne({ arId: body.arId }, {
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
                let artist = await db.get().collection(collection.ARTIST_COLLECTION).findOne({ email: body.email })
                if (artist) {
                    resolve({ emailErr: true })
                } else {
                    db.get().collection(collection.ARTIST_COLLECTION).updateOne({ arId: body.arId }, {
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

    // Artist About End

    // Product Start
    getPendingList: (arId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let product = await db.get().collection(collection.PRODUCT_COLLECTION).find({ arId, status: { $in: ['Pending', 'Rejected'] } }).toArray()
                for (let i = 0; i < product.length; i++) {
                    if (product[i].status == "Pending") {
                        product[i].pending = true
                    } else {
                        product[i].rejected = true
                    }
                }
                resolve(product)


            } catch (error) {
                reject(error)
            }
        })
    },

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
                    body.delete = false
                    body.status = "Pending"
                    body.price = Number(body.price)
                }
                db.get().collection(collection.PRODUCT_COLLECTION).insertOne(body)
                resolve()


            } catch (error) {
                reject(error)
            }
        })
    },

    getOneProduct: (prId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ prId })
                if (result.status == "Pending") {
                    result.pending = true
                } else if (result.status == "Rejected") {
                    result.rejected = true
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
                body.price = Number(body.price)
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ prId: body.prId }, {
                    $set: {
                        title: body.title,
                        size: body.size,
                        category: body.category,
                        medium: body.medium,
                        surface: body.surface,
                        quality: body.quality,
                        image: body.image,
                        price: parseInt(body.price)
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
                let image = null
                let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ prId })
                image = product.image
                db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ prId, status: "Pending" })
                resolve(image)



            } catch (error) {
                reject(error)
            }
        })
    },

    getAllProducts: (arId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await db.get().collection(collection.PRODUCT_COLLECTION).find({ arId, delete: false, status: { $in: ["Approve", "Ordered"] } }).toArray()
                for (let i = 0; i < result.length; i++) {
                    if (result[i].status == "Ordered") {
                        result[i].order = true
                    }
                }
                resolve(result)


            } catch (error) {
                reject(error)
            }
        })
    },
    getOrderStatus: (prId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ prId, status: "Ordered" })
                let status = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match: {
                            products: {
                                $elemMatch: {
                                    prId: prId,
                                    status: {
                                        $nin: ['Cancelled']
                                    }
                                }
                            }

                        }
                    },


                    {
                        $project: {
                            orId: 1, methord: 1, date: 1,
                        }
                    }
                ]).toArray()
              
                if (status.length > 0) {
                    product.orId = status[0].orId
                    product.methord = status[0].methord
                    product.date = help.dateWithMonth(status[0].date)
                }
                resolve(product)
            } catch (error) {
                reject(error)
            }
        })
    },
    // Product End


}