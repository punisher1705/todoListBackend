const bcrypt = require('bcrypt');
const saltRounds = 10;

let logger = require('../libs/loggerLib');

let hashpassword = (pass) => {
    let salt = bcrypt.genSaltSync(saltRounds)
    let hash = bcrypt.hashSync(pass, salt)
    return hash
}

let comparePassword = (oldPass, hashpassword, cb) => {
    bcrypt.compare(oldPass, hashpassword, (err, res) => {
        if(err) {
            logger.error(err.message, 'Comparison Error', 5)
            cb(err, null)
        } else {
            cb(null, res)
        }
    })
}

let comparePasswordSync = (pass, hash) => {
    return bcrypt.compareSync(pass, hash)
}

module.exports = {
    hashpassword: hashpassword,
    comparePassword: comparePassword,
    comparePasswordSync: comparePasswordSync
}