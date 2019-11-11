'use strict'

const mongoose = require('mongoose'),
    const Schema = mongoose.Schema();

let todoSchema = new Schema({
    todoId: {
        type: String,
        default: '',
        index: true,
        unique: true
    },
    todokName: {
        type: String,
        default: '',
    },
    assignTo: {
        type: String,
        default: 'Self'
    },
    assignedDate: {
        type: Date,
        default: Date.now()
    },
    dueDate: {
        type: Date,
        default: ''
    },
    assignToUser: {
        type: String,
        default: ''
    },
    todoDesc: {
        type: String,
        default: ''
    },
    attachFile: {
        type: String,
    },
    reminder: {
        type: int,
        default: 0
    }
})


mongoose.model('Todo',todoSchema)