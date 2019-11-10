const jwt = require('jsonwebtoken');
const shortid= require('shortid');
const secretKey = 'someStringWhichHasNoMeaningForItself';

let generateToken = (data, cb) =>{
    try{
        let claims = {
            jwtid: shortid.generate(),
            iat: Date.now(),
            exp: Math.floor((Date.now() / 1000) + 60 * 60 * 60),
            sub: 'authToken',
            iss: 'todo',
            data: data
        }
        let tokenDetails = {
            token: jwt.sign(claims, secretKey),
            tokenSecret: secretKey
        }
        cb(null, tokenDetails)
    } catch(err) {
        console.log(err)
        cb(err,null)
    }
}

let verifyClaim = (token, secretKey, cb) => {
    jwt.verify(token, secretKey, function(err,decode){
        if(err){
            console.log('error while verifying token')
            cb(err,null)
        } else {
            cb(null, decode)
        }
    })
}


module.exports = {
    generateToken: generateToken,
    verifyToken: verifyClaim
}