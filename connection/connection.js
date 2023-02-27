const mongoose = require('mongoose');

const connection = async () => {
    try {
        mongoose.set('strictQuery', true);
        await mongoose.connect("mongodb://localhost:27017/mi_redsocial");
        console.log("Connected to database: mi_redsocial");
    } catch (err) {
        console.log(err);
        throw new Error("Unable to connect to database");
    }
}

module.exports = { connection };