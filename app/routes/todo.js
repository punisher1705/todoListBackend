const express = require('express')
const router = express()
const todoController = require('./../controllers/todoController')
const appConfig = require('../../config/appConfig')

module.exports.setRouter = (app) => {

    let baseUrl =  `${appConfig.apiVersion}/todos`;

    app.post(`${baseUrl}/createTodo`, todoController.createTodo);
    app.get(`${baseUrl}/getAllTodos`, todoController.getAllTodos);
    app.get(`${baseUrl}/:todoId/getTodo`, todoController.getSingleTodo);
    app.get(`${baseUrl}/:todoId/edit`, todoController.editTodo);
    app.get(`${baseUrl}/:todoId/delete`, todoController.deleteTodo);


}