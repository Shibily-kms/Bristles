const db = require('../config/connection')
const collection = require('../config/collection')
const ObjectId = require('mongodb').ObjectId;


module.exports = {
    // Sign Start
    doSignIn: (body) => {
        return new Promise((resolve, reject) => {
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
        })
    },
    // Sign End

    // Category Start
    addCategory: (body) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({ title: body.title }).then((result) => {
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
                    db.get().collection(collection.CATEGORY_COLLECTION).insertOne(body).then((result) => {
                        resolve(result)
                    })
                }
            })
        })
    },

    getAllCategory: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).find().toArray().then((result) => {
                resolve(result)
            })
        })
    },

    getOneCategroy: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({ cgId: id }).then((result) => {
                resolve(result)
            })
        })
    },

    editCategory: (body, id) => {
        return new Promise(async (resolve, reject) => {
            let check = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ title: body.title })
            if (!check || check.cgId == id) {
                await db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ cgId: id }, {
                    $set: {
                        title: body.title
                    }
                }).then((result) => {
                    resolve(result)
                })
            } else {
                resolve({ nameError: true })
            }
        })
    },

    deleteCategory: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ cgId: id }).then(() => {
                resolve()
            })
        })
    },
    // Category End

    // Product Start
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
                body.delete = false,
                    body.status = 'Approve'
            }
            body.percentage = null
            if (body.ogPrice) {
                body.percentage = Math.round((body.price / body.ogPrice) * 100)
            }
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(body).then(() => {
                resolve()
            })


        })
    },

    getAllCatProduct: (CAT) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).find({ category: CAT, status: { $in: ['Approve'] }, delete: false }).toArray().then((result) => {
                resolve(result)
            })
        })
    },

    getOneProduct: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ prId: proId }).then((result) => {
                if (result.arId) {
                    db.get().collection(collection.ARTIST_COLLECTION).findOne({ arId: result.arId }).then((artist) => {
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
                    })
                }

                if (result.status == "Rejected") {
                    result.reject = true
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
                }).then(() => {
                    resolve(images)
                })
            })

        })
    },

    deleteProduct: (prId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ prId }, {
                $set: {
                    delete: true
                }
            }).then(() => {
                resolve()
            })
        })
    },
    // Product End

    // User Start
    getAllUser: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).find().toArray().then((user) => {
                for (let i = 0; i < user.length; i++) {
                    if (user[i].status == "Active") {
                        user[i].active = true
                    } else if (user[i].status == "Blocked") {
                        user[i].blocked = true
                    }
                }
                resolve(user)
            })
        })
    },
    activeAndBlockUser: (urId, status) => {
        return new Promise((resolve, reject) => {
            if (status == "blocked") {
                db.get().collection(collection.USER_COLLECTION).updateOne({ urId }, {
                    $set: {
                        status: "Blocked"
                    }
                }).then(() => {
                    resolve({ message: "User account Blocked" })
                })
            } else if (status == "active") {
                db.get().collection(collection.USER_COLLECTION).updateOne({ urId }, {
                    $set: {
                        status: "Active"
                    }
                }).then(() => {
                    resolve({ message: "User account Actived" })
                })
            }
        })
    },
    // User End

    // Artist Start
    getAllPendingArtist: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ARTIST_COLLECTION).find({ status: { $in: ["Pending", "Rejected"] } }).toArray().then((artist) => {
                for (let i = 0; i < artist.length; i++) {
                    if (artist[i].status == "Pending") {
                        artist[i].pending = true
                    } else if (artist[i].status == "Rejected") {
                        artist[i].rejected = true
                    }
                }
                resolve(artist)
            })
        })
    },

    getAllArtist: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ARTIST_COLLECTION).find({ status: { $in: ["Active", "Blocked"] } }).toArray().then((artist) => {
                for (let i = 0; i < artist.length; i++) {
                    if (artist[i].status == "Active") {
                        artist[i].active = true
                    } else if (artist[i].status == "Blocked") {
                        artist[i].blocked = true
                    }
                }
                resolve(artist)
            })
        })
    },

    approveArtist: (arId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ARTIST_COLLECTION).updateOne({ arId }, {
                $set: {
                    status: "Active"
                }
            }).then(() => {
                resolve()
            })
        })
    },

    rejectArtist: (arId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ARTIST_COLLECTION).updateOne({ arId }, {
                $set: {
                    status: "Rejected"
                }
            }).then(() => {
                resolve()
            })
        })
    },
    activeAndBlockArtist: (arId, status) => {
        return new Promise((resolve, reject) => {
            if (status == "blocked") {
                db.get().collection(collection.ARTIST_COLLECTION).updateOne({ arId }, {
                    $set: {
                        status: "Blocked"
                    }
                }).then(() => {
                    resolve({ message: "Artist account Blocked" })
                })
            } else if (status == "active") {
                db.get().collection(collection.ARTIST_COLLECTION).updateOne({ arId }, {
                    $set: {
                        status: "Active"
                    }
                }).then(() => {
                    resolve({ message: "Artist account Actived" })
                })
            }
        })
    },



    // Artist End
    // Pending Products Start
    getAllCatPending: (CAT) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).find({ category: CAT, status: { $in: ['Pending', 'Rejected'] }, delete: false }).toArray().then((result) => {
                for (let i = 0; i < result.length; i++) {
                    if (result[i].status == "Pending") {
                        result[i].Pending = true
                    }
                }
                resolve(result)
            })
        })
    },

    approveAndRejectProduct: (prId, option) => {
        return new Promise((resolve, reject) => {
            if (option == "approve") {
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ prId }, {
                    $set: {
                        status: "Approve"
                    }
                }).then(() => {
                    resolve({ approve: true })
                })
            } else if (option == "reject") {
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ prId }, {
                    $set: {
                        status: "Rejected"
                    }
                }).then(() => {
                    resolve({ reject: true })
                })
            }

        })
    },

    // Pending Products End
    // Carousel Start
    getCarousel: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CAROUSEL_COLLECTION).find().toArray().then((result) => {
                resolve(result)
            })
        })
    },

    addCarousel: (body) => {
        return new Promise((resolve, reject) => {
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
            db.get().collection(collection.CAROUSEL_COLLECTION).insertOne(body).then(() => {
                resolve()
            })
        })
    },

    deleteCarousel: (crId) => {
        return new Promise((resolve, reject) => {
            let image = null
            db.get().collection(collection.CAROUSEL_COLLECTION).findOne({ crId }).then((result) => {
                if (result) {
                    image = result.image
                    db.get().collection(collection.CAROUSEL_COLLECTION).deleteOne({ crId }).then(() => {
                        resolve(image)
                    })
                }
            })
        })
    }
    // Carousel End








}