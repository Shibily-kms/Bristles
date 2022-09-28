const client = require('twilio')('AC72717c826f8ab1f8c921a975f7f71b8c', 'aa0faf109eb533f8dc612dfe7e66e268');
const serviceSid = 'VAfd8b8483b29c8a6816871d0c20295559'

module.exports = {

    dosms: (mobile) => {
        return new Promise(async (resolve, reject) => {

            await client.verify.services(serviceSid).verifications.create({
                to: `+91${mobile}`,
                channel: 'sms'
            }).then((response) => {
                response.valid = true
                resolve(response)
            })

        })
    },
    otpVerify: (otp, mobile) => {
        return new Promise(async(resolve, reject) => {
            await client.verify.services(serviceSid).verificationChecks.create({
                to : `+91${mobile}`,
                code : otp
            }).then((verification)=>{
                resolve(verification.valid)
            }).catch((err)=>{
                resolve(err)
            })
        })
    }



}