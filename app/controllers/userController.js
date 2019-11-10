const mongoose = require('mongoose')
const shortid = require('shortid')
const time = require('./../libs/timeLib')
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib')
const validateInput = require('../libs/paramsValidationLib')
const check = require('../libs/checkLib')
const passwordLib = require('../libs/generatePasswordLib');
const token = require('../libs/tokenLib')

const UserModel = mongoose.model('User');
const AuthModel = mongoose.model('Auth')

let signUpFunction = (req, res) => {
    let validateUserInput = () => {
        return new Promise((resolve, reject) => {
            if(req.body.email) {
                if(!validateInput.Email(req.body.email)) {
                    let apiResponse = response.generate(true, 'Email does not meet the requirement', 400, null);
                    reject(apiResponse)
                } else if(check.isEmpty(req.body.password)) {
                    let apiResponse = reponse.generate(true, 'Password is missing', 400, null)
                    reject(apiResponse)
                } else {
                    resolve(req)
                }
            } else {
                logger.error('Field missing during User Creation','userController: createUser', 5)
                let apiResponse = response.generate(true, 'One or More Parameter(s) is missing', 400, null)
                reject(apiResponse)       
            }
        })
    }

    let createUser = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({email: req.body.email})
            .exec((err, retrievedUserDetails) => {
                if(err){  
                    logger.error(err.message, 'userController: createUser', 10)
                    let apiResponse = response.generate(true, 'Failed To Create User', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(retrievedUserDetails)) {
                    console.log(req.body)
                    let newUser = new UserModel({
                        userId: shortid.generate(),
                        firstName: req.body.firstName,
                        lastName: req.body.lastName || '',
                        email: req.body.email.toLowerCase(),
                        mobile: req.body.mobile,
                        password: passwordLib.hashpassword(req.body.password),
                        createdOn: time.now()
                    })
                    newUser.save((err, newUser) => {
                        if(err){
                            console.log(err)
                            logger.error(err.message,'userControll: createUSer', 10)
                            let apiResponse = response.generate(true, 'Failed to create new User', 500, null)
                            reject(apiResponse)
                        } else {
                            let newUserObj = newUser.toObject();
                            resolve(newUserObj)
                        } 
                    })
                } else {
                    logger.error('User Cannot be Created! User Already Present', 'userController: crateUser', 4)
                    let apiResponse = response.generate(true, 'User Already Present with thi email')
                    reject(apiResponse)
                }
            })
        })
    }

    validateUserInput(req, res)
        .then(createUser)
        .then((resolve) => {
            delete resolve.password
            let apiResponse = response.generate(false, 'User Created', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err)
            res.send(err)
        })
}

let loginFunction = (req, res) => {

    let findUser = () => {
        // console.log('findUser')
        return new Promise((resolve, reject) => {
            if(req.body.email) {
                // console.log(req.body)
                UserModel.findOne({email: req.body.email}, (err, userDetails) => {
                    if(err) {
                        // console.log(err)
                        logger.error('Failed to Retrieve User Data','userController: findUser', 10)
                        let apiResponse = response.generate(true, 'Failed To find User Details', 500, null)
                        reject(apiResponse)
                    } else if(check.isEmpty(userDetails)) {
                        logger.error('No USer Found', 'userController: findUser', 7);
                        let apiResponse = response.generate(true, 'NO User Details Found', 404, null)
                        reject(apiResponse)
                    } else {
                        logger.info('User Found', 'userController: findUser', 10);
                        resolve(userDetails)
                    }
                })
            } else {
                let apiResponse = response.generate(true, 'Email Paramater Missing', 400, null)
                reject(apiResponse)
            }
        })
    }

    let validatePassword = (retrievedUserDetails) => {
        return new Promise ((resolve, reject) => {
            passwordLib.comparePassword(req.body.password, retrievedUserDetails.password, (err, isMatch) => {
                if(err) {
                    logger.error(err.message, 'userController: validatePassword', 10)
                    let apiResponse = response.generate(true, 'Login Failed', 500, null)
                } else if(isMatch) {
                    console.log(isMatch)
                    let retrievedUserDetailsObj = retrievedUserDetails.toObject()
                    delete retrievedUserDetailsObj.password
                    delete retrievedUserDetailsObj._id
                    delete retrievedUserDetailsObj.__v
                    delete retrievedUserDetailsObj.createdOn
                    delete retrievedUserDetailsObj.modifiedOn
                    resolve(retrievedUserDetailsObj)
                } else {
                    logger.info('Login Failed due to Invalid Password', 'userController: validatePassword', 10)
                    let apiResponse = response.generate(true, 'Wrong Password. Login Failed', 400, null)
                    reject(apiResponse)
                }
            })
        })
    }

    let generateToken = (userDetails) => {
        // console.log("Generate Token")
        return new Promise((resolve, reject) => {
            token.generateToken(userDetails,(err, tokenDetails) => {
                if(err){
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else {
                    tokenDetails.userId = userDetails.userId
                    tokenDetails.userDetails = userDetails
                    resolve(tokenDetails)
                }
            })
        })
    }

    let saveToken = (tokenDetails) =>{
        console.log('Save Token')
        return new Promise((resolve, reject) => {
            AuthModel.findOne({userId: tokenDetails.userId}, (err, retrievedTokenDetails) => {
                if(err){
                    logger.error(err.message, 'User Controller: saveToken', 10)
                    let apiResponse = response.generate(true,'Failed to Generate Token', 500, null)
                    reject(apiResponse)
                } else if(check.isEmpty(retrievedTokenDetails)){
                    let newAuthToken = new AuthModel({
                        userId: tokenDetails.userId,
                        authToken: tokenDetails.token,
                        tokenSecret: tokenDetails.tokenSecret,
                        tokenGenerationTime: time.now()
                    })
                    newAuthToken.save((err, newTokenDetails) => {
                        if(err){
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true,'Failed to generate Token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        } 
                    })
                } else {
                    retrievedTokenDetails.authToken = tokenDetails.token
                    retrievedTokenDetails.tokenSecret = tokenDetails.tokenSecret
                    retrievedTokenDetails.tokenGenerationTime = time.now()
                    retrievedTokenDetails.save((err,newTokenDetails) => {
                        if(err) {
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed to Generate Token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        }
                    })
                }
            })
        })
    }

    findUser(req, res)
     .then(validatePassword)
     .then(generateToken)
     .then(saveToken)
     .then((resolve) => {
         let apiResponse = response.generate(false, 'Login Successful', 200, resolve)
         res.status(200)
         res.send(apiResponse)
     })
     .catch((err) => {
         res.status(err.status)
         res.send(err)
     })
}

let logout = (req, res) => {
    AuthModel.findOneAndRemove({userId: req.user.userId}, (err, result) => {
        if(err){
            logger.error(err.message, 'userController: logout', 10)
            let apiResponse = response.generate(true, `Error Occured: ${err.message}`, 500, null)
            res.send(apiResponse)
        } else if(check.isEmpty(result)){
            let apiResponse = response.generate(true, 'Already Logged Out or Invalid UserId', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Logged Out Successfully', 200, result)
            res.send(apiResponse)
        }
    })
}

module.exports = {
    signUpFunction: signUpFunction,
    loginFunction: loginFunction,
    logout: logout
}