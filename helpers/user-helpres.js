const db = require('../config/connection')
const collection = require('../config/collection')
const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const optionHelpers = require('../helpers/option-helper');
const { resolve } = require('promise');

module.exports = {
    // User Sign Start
    doSignUp: (body) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ email: body.email }).then(async (user) => {
                if (user) {

                    resolve({ emailError: true })
                } else {
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
                    db.get().collection(collection.USER_COLLECTION).insertOne(body).then((result) => {
                        resolve(result)
                    })
                }
            })
        })
    },

    doSignIn: (body) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ email: body.email }).then(async (data) => {
                if (data) {
                    await bcrypt.compare(body.password, data.password).then((status) => {
                        if (status) {
                            delete data.password;
                            delete data.address;
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
    checkAccountActive: (urId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ urId, status: "Active" }).then((result) => {
                if (result) {
                    resolve(result)
                } else {
                    resolve({ activeErr: true })
                }
            })
        })
    },
    // Sign End

    // Set Token Start
    setToken: () => {
        return new Promise((resolve, reject) => {
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
        })
    },
    // Set Token End

    // Product Start

    getAllProduct: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).find({status:"Approve",delete:false}).toArray().then((produt) => {
                resolve(produt)
            })
        })
    },
    getLatestProducts: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).find({ delete: false, status: 'Approve' }).sort({ _id: -1 })
                .limit(8).toArray().then((product) => {
                    resolve(product)
                })

        })
    },
    // Product End

    // User About Start
    getUser: (urId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ urId }).then((result) => {
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
            })
        })
    },

    editProfile: (body) => {
        return new Promise((resolve, reject) => {
            let image = null
            db.get().collection(collection.USER_COLLECTION).findOne({ urId: body.urId }).then((user) => {
                if (body.image == null) {
                    body.image = user.image
                } else {
                    image = user.image
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
                db.get().collection(collection.USER_COLLECTION).updateOne({ urId: body.urId }, {
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
                        email: user.email,
                        mobile: body.mobile,
                        place: body.place,
                        image: body.image,
                        urId: user.urId,
                        deleteImage: image
                    }
                    resolve(obj)
                })
            })

        })
    },

    changePassword: (body) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ urId: body.urId }).then((user) => {
                if (user) {
                    bcrypt.compare(body.currentPassword, user.password).then(async (status) => {
                        if (status) {
                            let newPass = await bcrypt.hash(body.newPassword, 10)
                            db.get().collection(collection.USER_COLLECTION).updateOne({ urId: body.urId }, {
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
            db.get().collection(collection.USER_COLLECTION).findOne({ email: body.email }).then((user) => {
                if (user) {
                    resolve({ emailErr: true })
                } else {
                    db.get().collection(collection.USER_COLLECTION).updateOne({ urId: body.urId }, {
                        $set: {
                            email: body.email
                        }
                    }).then(() => {
                        resolve(body.email)
                    })
                }
            })
        })
    }
    // User About End

}