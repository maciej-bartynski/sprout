const Test = require('./models/test');

module.exports = () => {
    Test.findOne({ staticId: 'some-test-string' }, (err, test) => {
        if (err) {
            console.log(`MONGODB. Test model searching error.`)
            return
        }

        if (!test) {
            const test = new Test({ counter: 0 })
            test.save((err) => {
                if (err) {
                    console.log(`MONGODB. Test model population error.`)
                    return;
                }
                console.log(`MONGODB. Test model populated.`)
            })
            return
        }

        console.log(`MONGODB. Test populated. ${test.counter}`)
    })
}
