const db = require('../config/connection')
const collection = require('../config/collection')
const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');

module.exports = {
    // Sign Start
    doSignUp: (body) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ARTIST_COLLECTION).findOne({ email: body.email }).then(async (user) => {
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
                        body.arId = "AR"+randomString
                    }
                    body.status = "Pending"
                    body.password = await bcrypt.hash(body.password, 10)
                    db.get().collection(collection.ARTIST_COLLECTION).insertOne(body).then((result) => {
                        resolve(result)
                    })
                }
            })
        })
    },

    doSignIn: (body) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ARTIST_COLLECTION).findOne({email:body.email,status:"Active"}).then(async(data)=>{
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
    },

    checkAccountActivation:(CHECK_ID)=>{
        return new Promise((resolve, reject) => { 
            db.get().collection(collection.ARTIST_COLLECTION).findOne({_id:ObjectId(CHECK_ID)}).then((result)=>{
               if(result.status == "Active"){
                    resolve({active:true})
                }else if(result.status == "Pending"){
                    resolve({NotActivated : true})
                }else if(result.status == "Rejected"){
                    resolve({Rejected :true})
                }
            })
         })
    }
    // Sign End

}