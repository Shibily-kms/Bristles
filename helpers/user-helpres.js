var db = require('../config/connection')
var collection = require('../config/collection')
var ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');

module.exports = {
    // Usr Sign Up
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
                        body.urId = "UR"+randomString
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
            db.get().collection(collection.USER_COLLECTION).findOne({email:body.email}).then(async(data)=>{
                if(data){
                    await bcrypt.compare(body.password,data.password).then((status)=>{
                        if(status){
                            delete data.password;
                            resolve(data)
                        }else{
                            resolve({passError :true})
                        }
                    })
                }else{
                    resolve({emailError:true})
                }
            })
        })
    }


}