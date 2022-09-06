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
            let check = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ title:body.title })
            if (!check || check.cgId == id ) {
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
    
    deleteCategory:(id)=>{
        return new Promise((resolve, reject) => { 
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({cgId:id}).then(()=>{
                resolve()
            })
         })
    }








}