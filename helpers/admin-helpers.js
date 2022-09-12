var db = require('../config/connection')
var collection = require('../config/collection')
var ObjectId = require('mongodb').ObjectId;


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
                body.delete = false
            }
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(body).then(() => {
                resolve()
            })


        })
    },

    getAllCatProduct: (CAT) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).find({ category: CAT,delete:false }).toArray().then((result) => {
                resolve(result)
            })
        })
    },

    getOneProduct: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ prId: proId }).then((result) => {
                if(result.arId){
                    db.get().collection(collection.ARTIST_COLLECTION).findOne({arId:result.arId}).then((artist)=>{
                        let artistDetails = {
                            arId : artist.arId,
                            email : artist.email,
                            name : artist.userName,
                            image : artist.image,
                            rate : artist.rate,
                            rateCount : artist.rateCount
                        }
                        result.artist = artistDetails
                    })
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
                        medium: body.medium,
                        surface: body.surface,
                        quality: body.quality,
                        image: body.image,
                        price : parseInt(body.price) 
                    }
                }).then(() => {
                    resolve(images)
                })
            })

        })
    },

    deleteProduct:(prId)=>{
        return new Promise((resolve, reject) => { 
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({prId},{
                $set:{
                    delete : true
                }
            }).then(()=>{
                resolve()
            })
         })
    },
    // Product End

    // User Start
    getAllUser:()=>{
        return new Promise((resolve, reject) => { 
            db.get().collection(collection.USER_COLLECTION).find().toArray().then((user)=>{
                resolve(user)
            })
         })
    },
    // User End

    // Artist Start
    getAllPendingArtist:()=>{
        return new Promise((resolve, reject) => { 
            db.get().collection(collection.ARTIST_COLLECTION).find({status:"Pending"}).toArray().then((artist)=>{
                resolve(artist)
            })
         })
    },

    getAllArtist:()=>{
        return new Promise((resolve, reject) => { 
            db.get().collection(collection.ARTIST_COLLECTION).find({status:"Active"}).toArray().then((artist)=>{
                resolve(artist)
            })
         })
    },


    // Artist End








}