const db = require('../config/connection')
const collection = require('../config/collection')
const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const optionHelpers = require('../helpers/option-helper');
const { resolve } = require('promise');
const { Collection } = require('mongo');
const { response } = require('express');

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
            db.get().collection(collection.PRODUCT_COLLECTION).find({ status: "Approve", delete: false }).toArray().then((produt) => {
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

                db.get().collection(collection.USER_COLLECTION).updateOne({ urId: body.urId }, {
                    $set: {
                        firstName: body.firstName,
                        lastName: body.lastName,
                        userName: body.userName,
                        mobile: body.mobile,
                        place: body.place,
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
    },

    getAlladdress: (urId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ urId }).then((result) => {
                let address = []
                address.addresses = result.addresses
                address.current = result.currentAddress
                address.addresses = address.addresses.slice(-4);
                for (let i = 0; i < address.addresses.length; i++) {
                    if (address.addresses[i].adId == address.current) {
                        address.addresses[i].current = true
                    }
                }
                resolve(address)
                console.log(address);
            })
        })
    },
    addNewAddress: (body, urId) => {
        return new Promise((resolve, reject) => {
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
            }).then(() => {
                resolve()
            })
        })
    },
    updateAddress: (body, adId, urId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ urId, "addresses.adId": adId }, {
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
            }).then((response) => {
                resolve(response)
            })
        })
    },
    deleteAddress: (adId, urId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ urId }, {
                $pull: {
                    addresses: {
                        adId
                    }
                }
            }).then(() => {
                resolve({ status: true })
            })
        })
    },
    // User About End

    // Cart Start
    addToCart: (urId, body) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).findOne({ urId }).then(async (cart) => {
                if (cart) {
                    let status = await db.get().collection(collection.CART_COLLECTION).findOne({ urId, list: { $in: [body.prId] } })
                    if (status) {
                        resolve({ alreadyErr: true })
                    } else {
                        db.get().collection(collection.CART_COLLECTION).updateOne({ urId }, {
                            $push: {
                                list: body.prId
                            }
                        }).then((response) => {
                            resolve(response)
                        })
                    }

                } else {
                    db.get().collection(collection.CART_COLLECTION).insertOne({ urId, list: [body.prId] }).then((response) => {
                        resolve(response)
                    })
                }
            })
        })
    },

    getCartCount: (urId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).findOne({ urId }).then((result) => {
                if (result) {
                    resolve(result.list.length)
                } else {
                    let count = 0
                    resolve(count)
                }
            })
        })
    },

    getCartProduct: (urId) => {
        return new Promise(async (resolve, reject) => {
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
        })
    },

    removeProductFromCart: (prId, urId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).updateOne({ urId }, {
                $pull: {
                    list: prId
                }
            }).then((result) => {
                resolve(result)
            })
        })
    },

    checkGuestCast: (urId, token) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).findOne({ urId }).then(async (result) => {
                if (result) {
                    let tokenCart = await db.get().collection(collection.CART_COLLECTION).findOne({ urId: token })
                    await db.get().collection(collection.CART_COLLECTION).updateOne({ urId }, {
                        $addToSet: {
                            list: {
                                $each: tokenCart.list
                            }
                        }
                    }).then(() => {
                        db.get().collection(collection.CART_COLLECTION).deleteOne({ urId: token }).then(() => {
                            resolve()
                        })
                    })
                } else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ urId: token }, {
                        $set: {
                            urId: urId
                        }
                    }).then(() => {
                        resolve()
                    })
                }
            })
        })
    },
    // Cart End

    // CheckOut start
    changeCurrentAddress: (adId, urId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ urId }, {
                $set: {
                    currentAddress: adId
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },
    checkCouponCode: (body) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).findOne({ cpCode: body.cpCode, used: false }).then((result) => {
                if (result) {
                    // Check validity
                    var d = new Date();
                    let str = d.toJSON().slice(0, 10);
                    if (str >= result.validity) {
                        resolve({ expired: true })
                    } else {
                        resolve(result)
                    }
                    console.log(str);
                } else {
                    resolve({ notAvailable: true })
                }
            })
        })
    },
    orderAccessing: (body, urId) => {
        return new Promise(async (resolve, reject) => {
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
            obj.products = []
            obj.address = null
            // Product
            if (body.prId) {
                obj.products.push(body.prId)
            } else {
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
            await db.get().collection(collection.ORDER_COLLECTION).insertOne(obj).then((response) => {
                response.methord = obj.methord
                response.products = obj.products
                resolve(response)
            })
        })
    },
    afterOreder: (response, urId, cpCod) => {
        return new Promise(async (resolve, reject) => {
            for (let i = 0; i < response.products.length; i++) {
                await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ prId: response.products[i] }, {
                    $set: {
                        status: "Ordered"
                    }
                })
                await db.get().collection(collection.CART_COLLECTION).updateOne({ urId }, {
                    $pull: {
                        list: response.products[i]
                    }
                })
            }
            if (!cpCod == '') {
                await db.get().collection(collection.COUPON_COLLECTION).updateOne({ cpCod }, {
                    $set: {
                        user: true
                    }
                })
            }
            resolve(urId)
        })
    }
    // CheckOut End

}