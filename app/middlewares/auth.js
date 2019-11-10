const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const request = require('request')
const logger = require('../libs/loggerLib');
const responseLib = require('../libs/responseLib');
const token = require('../libs/tokenLib');
const check = require('../libs/checkLib');

const AuthModel = mongoose.model('Auth')

let isAuthorized = (req, res, next) => {
    if(req.params.authToken || req.query.authToken || req.body.authToken || req.header('authToken')){
        AuthModel.findOne({authToken: req.header('authToken') ||req.params.authToken || req.query.authToken || req.body.authToken}, (err, authDetails) => {
            if(err){
                logger.error(err.message, 'AuthorizationMiddleware', 10)
                let apiResponse = responseLib.generate(true, 'failed to authorize', 500, null)
                res.send(apiResponse)
            } else if(check.isEmpty(authDetails)){
                logger.error('No Authorization is Present', 'AuthorizationMiddleware',10)
                let apiResponse = responseLib.generate(true, 'Invalid or Expired Authorization Key', 404, null)
                res.send(apiResponse)
            } else {
                token.verifyToken(authDetails.authToken, authDetails.tokenSecret, (err, decoded) => {
                    if(err){
                        logger.error(err.message, 'AuthorizationMiddleware',10)
                        let apiResponse = responseLib.generate(true, 'Failed tp Authorize', 500, null)
                        res.send(apiResponse)
                    } else {
                        req.user = {userId: decoded.data.userId}
                        next()
                    }
                })
            }
        })
    } else {
        logger.error('Authorization Token Missing', 'AuthorizationMiddleware', 5)
        let apiResponse = responseLib.generate(true, 'Authorization Token is missing')
        res.send(apiResponse)
    }
}

module.exports = {
    isAuthorized: isAuthorized
}