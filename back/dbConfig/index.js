require('dotenv').config();
const mongoose = require('mongoose');
const populate = require('./populate');

module.exports = () => {
    mongoose.connect(process.env.DATABASE, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(data => {
            console.log(`MONGODB. Database connected. ${data}`);
            populate();
        })
}