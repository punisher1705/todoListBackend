const mongoose = require('mongoose')
const shortid = require('shortid')
const time = require('../libs/timeLib')
const response = require('../libs/responseLib')
const logger = require('../libs/loggerLib')
const check = require('../libs/checkLib')
const token = require('../libs/tokenLib')

const TodoModel = mongoose.model('Todo')

let getAllTodos = (req, res) => {
    TodoModel.find()
        .select('-__v -_id')
        .lean()
        .exec((err, result) => {
            if(err){
                logger.error(err.message, 'todoController: getAllTodos',10)
                let apiResponse = response.generate(true, 'Failed to Find Todo', 500, null)
                res.send(apiResponse)
            } else if(check.isEmpty(result)) {
                logger.info('No Todo Found', 'todoController: getAllTodos')
                let apiResponse = response.generate(true, 'No Todo Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'Found All Todos', 200, result)
                res.send(apiResponse)                
            }
        })
}

let getSingleTodo = (req, res) => {
    TodoModel.findOne({'todoId': req.params.todoId})
        .select('-__v -_id')
        .lean()
        .exec((err,result)=>{
            if(err){
                logger.error(err.message, 'todoCOntroller: getSingleTodo',10)
                let apiResponse = response.generate(true, 'Failed to Find Todo detail', 500, null)
                res.send(apiResponse)
            } else if(check.isEmpty(result)) {
                logger.info('No Todo Found', 'todoController: getSingleTodo')
                let apiResponse = response.generate(true, 'No Todo Found',404,null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'todoContoller', 200, result)
                res.send(apiResponse)
            }
        })
}


let createTodo = (req, res) => {
    let validateUserInput = () => {
        return new Promise((resolve, reject) => {
            if(check.isEmpty(req.body.todoName)){
                let apiResponse = response.generate(true, 'Please Fill Mandatory Field', 500, 10)
                reject(apiResponse)
            } else {
                resolve(apiResponse)
            }
        })
    }

    let createNewTodo = () => {
        return new Promise((resolve, reject) => {
            let newTodo = new TodoModel({
                todoId: 'Todo-'+shortid.generate(),
                todoName: req.body.todoName,
                assingTo: req.body.assingTo,
                assinedDate: req.body.assignedDate,
                dueDate: req.body.dueDate,
                assignToUser: req.body.assignToUser,
                todoDesc: req.body.todoDesc,
                attachFile: req.body.uploadedFile,
                reminder: req.body.reminder
            })

            newTodo.save((err,newTodo) => {
                if(err){
                    logger.error(err.message, 'createTodo: createNewTodo',10)
                    let apiResponse = response.generate(true,'Failed to create todo', 500, null)
                    reject(apiResponse)
                } else {
                    let newTodoObj = newTodo.toObject()
                    resolve(newTodoObj)
                }
            })
        })
    }

    validateUserInput(req, res)
        .then(createNewTodo)
        .then((resolve)=>{
            let apiResponse = response.generate(false, "Todo Created", 200, resolve)
            res.send(apiResponse)
        })
        .catch((err)=>{
            res.send(err)
        })
}


module.exports = {
    getAllTodo: getAllTodo,
    createTodo: createTodo,
    getSingleTodo: getSingleTodo,
    // editIssue: editIssue,
    // deleteIssue: deleteIssue,
}