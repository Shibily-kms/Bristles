const db = require('../config/connection')
const collection = require('../config/collection')
const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const help = require('../helpers/help-fuctions')

module.exports = {
    // Sign Start
    verifyEmail: (email) => {
        console.log(email, 'email');
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ARTIST_COLLECTION).findOne({ email }).then((response) => {
                let obj = {
                    data: response,
                    emailError: true       
                }
                if (response) {
                    resolve(obj)
                } else {
                    resolve({ status: true })
                }
            })
        })
    },
    doSignUp: (body) => {
        console.log('5');
        return new Promise(async (resolve, reject) => {
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
            await db.get().collection(collection.ARTIST_COLLECTION).insertOne(body).then((result) => {
                console.log('6');
                resolve(result)
            })
        })
    },

    doSignIn: (body) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ARTIST_COLLECTION).findOne({ email: body.email, status: "Active" }).then(async (data) => {
                if (data) {
                    await bcrypt.compare(body.password, data.password).then((status) => {
                        if (status) {
                            delete data.password;
                            resolve(data)
                        } else {
                            resolve({ passError: true })
                        }
                    })
                } else {
                    resolve({ emailError: true })
                }
            })
        })
    },

    setNewPassword: (body, arId) => {
        return new Promise(async (resolve, reject) => {
            body.password = await bcrypt.hash(body.password, 10)
            await db.get().collection(collection.ARTIST_COLLECTION).updateOne({ arId }, {
                $set: {
                    password: body.password
                }
            }).then((result) => {
                resolve(result)
            })
        })
    },

    checkAccountActivation: (CHECK_ID) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ARTIST_COLLECTION).findOne({ _id: ObjectId(CHECK_ID) }).then((result) => {
                console.log(result);
                if (result.status == "Active") {
                    resolve({ Active: true })
                } else if (result.status == "Pending") {
                    resolve({ NotActivated: true })
                } else if (result.status == "Rejected") {
                    resolve({ Rejected: true })
                }
            })
        })
    },
    checkAccountActive: (arId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ARTIST_COLLECTION).findOne({ arId, status: "Active" }).then((result) => {
                if (result) {
                    resolve(result)
                } else {
                    resolve({ activeErr: true })
                }
            })
        })
    },
    // Sign End

    // Artist About Start
    getArtist: (arId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ARTIST_COLLECTION).findOne({ arId }).then((result) => {

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
            })
        })
    },

    editProfile: (body) => {
        return new Promise((resolve, reject) => {
            let image = null
            db.get().collection(collection.ARTIST_COLLECTION).findOne({ arId: body.arId }).then((artist) => {
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
                }).then(() => {
                    let obj = {
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
                    resolve(obj)
                })
            })

        })
    },

    changePassword: (body) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.ARTIST_COLLECTION).findOne({ arId: body.arId }).then((artist) => {
                if (artist) {
                    bcrypt.compare(body.currentPassword, artist.password).then(async (status) => {
                        if (status) {
                            let newPass = await bcrypt.hash(body.newPassword, 10)
                            db.get().collection(collection.ARTIST_COLLECTION).updateOne({ arId: body.arId }, {
                                $set: {
                                    password: newPass
                                }
                            }).then((response) => {
                                resolve(response)
                            })
                        } else {
                            resolve({ passErr: true })
                        }
                    })
                }
            })
        })
    },


    changeEmail: (body) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.ARTIST_COLLECTION).findOne({ email: body.email }).then((artist) => {
                if (artist) {
                    resolve({ emailErr: true })
                } else {
                    db.get().collection(collection.ARTIST_COLLECTION).updateOne({ arId: body.arId }, {
                        $set: {
                            email: body.email
                        }
                    }).then(() => {
                        resolve(body.email)
                    })
                }
            })
        })
    },

    // Artist About End

    // Product Start
    getPendingList: (arId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).find({ arId, status: { $in: ['Pending', 'Rejected'] } }).toArray().then((product) => {
                for (let i = 0; i < product.length; i++) {
                    if (product[i].status == "Pending") {
                        product[i].pending = true
                    } else {
                        product[i].rejected = true
                    }
                }
                resolve(product)
            })
        })
    },

    addProduct: (body) => {
        return new Promise((resolve, reject) => {
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
            }
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(body).then(() => {
                resolve()
            })
        })
    },

    getOneProduct: (prId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ prId }).then((result) => {
                if (result.status == "Pending") {
                    result.pending = true
                } else if (result.status == "Rejected") {
                    result.rejected = true
                }
                resolve(result)
            })
        })
    },

    editProduct: (body) => {
        return new Promise((resolve, reject) => {
            let images = null

            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ prId: body.prId }).then((product) => {
                if (body.image.length == 0) {
                    body.image = product.image
                } else {
                    images = product.image
                }

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
                }).then(() => {
                    resolve(images)
                })
            })
        })
    },

    deleteProduct: (prId) => {
        return new Promise((resolve, reject) => {
            let image = null
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ prId }).then((product) => {
                image = product.image
                db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ prId, status: "Pending" }).then(() => {
                    resolve(image)
                })
            })
        })
    },

    getAllProducts: (arId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).find({ arId, delete: false, status: { $in: ["Approve", "Ordered"] } }).toArray().then((result) => {
                for (let i = 0; i < result.length; i++) {
                    if (result[i].status == "Ordered") {
                        result[i].order = true
                    }
                }
                resolve(result)
            })
        })
    },
    getOrderStatus: (prId) => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ prId, status: "Ordered" })
            let status = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        products: {
                            $in: [prId]
                        }
                    }
                },
                {
                    $project: {
                        orId: 1, methord: 1, status: 1, deliveryDate: 1
                    }
                }
            ]).toArray()
            console.log(status);
            if (status.length > 0) {
                product.orId = status[0].orId
                product.methord = status[0].methord
                product.status = status[0].status
                product.date = help.dateWithMonth(status[0].deliveryDate)
            }
            resolve(product)
        })
    },
    // Product End


}