const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    counter: {
        type: Number,
        default: 0,
    },
    staticId: { 
        type: String,
        default: 'some-test-string'
    }

})

module.exports = mongoose.model('Test', testSchema)
 