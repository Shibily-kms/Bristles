var db = require('../config/connection')
var collection = require('../config/collection')
var ObjectId = require('mongodb').ObjectId;


module.exports = {
    doSignIn : (body)=>{
        return new Promise((resolve, reject) => { 
            let adminData = {
                username : "Bristles",
                email : "admin@gmail.com",
                password : '123',
            }
            if(adminData.email == body.email){
                if(adminData.password == body.password){
                    resolve(adminData)
                }else{
                    resolve({passError : true})
                }
            }else{
                resolve({emailError : true})
            }
         })
    }








}