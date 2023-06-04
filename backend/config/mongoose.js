//require the library
const mongoose = require('mongoose');

mongoose.set('strictQuery',true);
// connect to the database

// const url = process.env.MONGODB_URL;
mongoose.connect("mongodb+srv://admin:982145Ashu@cluster0.fsfplic.mongodb.net/?retryWrites=true&w=majority"); 


// acquire the connection to check if it is successfull
const db = mongoose.connection;

//error
db.on('error',console.error.bind(console,'error connection to db'));

//successful
db.once('open',function(){
    console.log('successfull connected to the database');
});

module.exports = db;
