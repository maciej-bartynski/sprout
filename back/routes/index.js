const home = require('./home');
const signin = require('./signin');
const signup = require('./signup');

module.exports = (router) => {
    router.get('/test', (req, res)=>res.json({ msg: "test succeed"}))
    router.get('/api/home', home);
    router.get('/api/signup', signup);
    router.get('/api/signin', signin);
}