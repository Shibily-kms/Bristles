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
            db.get().collection(collection.PRODUCT_COLLECTION).find().toArray().then((produt) => {
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

    // Filter Start
    filterProduct: (category, medium, surface, quality) => {

        return new Promise(async (resolve, reject) => {
            let response = []
            let categoryList = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            let optionList = optionHelpers
            // let FullProduct = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()





            // if (typeof category == "string") {
            //     tickCategory(category)
            //     // category = [category]
            // } else if (typeof category == "object") {
            //     for (let i = 0; i < category.length; i++) {
            //         tickCategory(category[i])
            //     }
            //     // category = Object.values(category)
            // } else {
            //     // category = []
            // }

            // if (typeof medium == "string") {
            //     tickMedium(medium)
            //     medium = [medium]
            // } else if (typeof medium == "object") {
            //     for (let i = 0; i < medium.length; i++) {
            //         tickMedium(medium[i])
            //         medium = Object.values(medium)
            //     }
            // } else {
            //     medium = []
            // }
            // if (typeof surface == "string") {
            //     tickSurface(surface)
            // } else if (typeof surface == "object") {
            //     for (let i = 0; i < surface.length; i++) {
            //         tickSurface(surface[i])

            //     }
            // }
            // if (typeof quality == "string") {
            //     tickQuality(quality)
            // } else if (typeof quality == "object") {
            //     for (let i = 0; i < quality.length; i++) {
            //         tickQuality(quality[i])

            //     }
            // }
            // // Tick Funcitons Start
            // function tickCategory(item) {
            //     for (let i = 0; i < categoryList.length; i++) {
            //         if (categoryList[i].title == item) {
            //             categoryList[i].tick = true
            //         }


            //     }
            //     return;
            // }
            // function tickMedium(item) {
            //     for (let i = 0; i < optionList.medium.length; i++) {
            //         if (optionList.medium[i].name == item) {
            //             optionList.medium[i].tick = true
            //         }
            //     }
            //     return;
            // }
            // function tickSurface(item) {
            //     for (let i = 0; i < optionList.surface.length; i++) {
            //         if (optionList.surface[i].name == item) {
            //             optionList.surface[i].tick = true
            //         }
            //     }
            //     return;
            // }
            // function tickQuality(item) {
            //     for (let i = 0; i < optionList.quality.length; i++) {
            //         if (optionList.quality[i].name == item) {
            //             optionList.quality[i].tick = true
            //         }
            //     }
            //     return;
            // }

            response.categoryList = categoryList
            response.optionList = optionList
            // Tick Functions End

            // let filter = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: { $in: category },medium:{$in : medium} }).toArray()

            // response.product = filter
            resolve(response)


        })
    },
    // Filter End

    // Search Start
    searchProduct: (question) => {
        return new Promise(async (resolve, reject) => {
            let searchResult = []
            if (question == '') {
                resolve(searchResult)
            } else {
                let product = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
                let searchPattern = new RegExp('(\\w*' + question + '\\w*)', 'gi');
                for (let i = 0; i < product.length; i++) {
                    let check = product[i].title.match(searchPattern)
                    if (check) {
                        searchResult.push(product[i])
                    }
                }
                resolve(searchResult)
            }
        })
    },

    // Search End


    // User About Start
    getUser: (urId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ urId }).then((result) => {
                delete result.password;
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
                    let obj= {
                        firstName: body.firstName,
                        lastName: body.lastName,
                        userName: body.userName,
                        email : user.email,
                        mobile: body.mobile,
                        place: body.place,
                        image: body.image,
                        urId : user.urId,
                        deleteImage : image
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

    changeEmail:(body)=>{
        return new Promise((resolve, reject) => { 
            db.get().collection(collection.USER_COLLECTION).findOne({email:body.email}).then((user)=>{
                if(user){
                    resolve({emailErr:true})
                }else{
                    db.get().collection(collection.USER_COLLECTION).updateOne({urId:body.urId},{
                        $set:{
                            email : body.email
                        }
                    }).then(()=>{
                        resolve(body.email)
                    })
                }
            })
         })
    }
    // User About End

}