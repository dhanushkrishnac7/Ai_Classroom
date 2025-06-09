const mongoose = require('mongoose');

const dotenv = require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI

function DB_CONNECT() {
    mongoose.connect(MONGO_URI)
        .then(client => {
            console.log('Connected to MongoDB');
        })
        .catch(err => {
            console.error('Failed to connect to MongoDB', err);
        });
}

module.exports = DB_CONNECT;

