const db = require('../config/connection')
const collection = require('../config/collection')
const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const optionHelpers = require('../helpers/option-helper');

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

    getAllProduct: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).find().toArray().then((produt) => {
                resolve(produt)
            })
        })
    },

    // Filter Start
    filterProduct: (category, medium, surface, quality) => {

        return new Promise(async (resolve, reject) => {
            let response = []
            let categoryList = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            let otherList = optionHelpers
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
            //     for (let i = 0; i < otherList.medium.length; i++) {
            //         if (otherList.medium[i].name == item) {
            //             otherList.medium[i].tick = true
            //         }
            //     }
            //     return;
            // }
            // function tickSurface(item) {
            //     for (let i = 0; i < otherList.surface.length; i++) {
            //         if (otherList.surface[i].name == item) {
            //             otherList.surface[i].tick = true
            //         }
            //     }
            //     return;
            // }
            // function tickQuality(item) {
            //     for (let i = 0; i < otherList.quality.length; i++) {
            //         if (otherList.quality[i].name == item) {
            //             otherList.quality[i].tick = true
            //         }
            //     }
            //     return;
            // }

            response.categoryList = categoryList
            response.otherList = otherList
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

}