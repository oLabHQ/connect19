// var appEmail = process.env.APP_ENV == "production" ? 'c19.olab@gmail.com' : 'connect19test@gmail.com';
// var appEmailPassword = process.env.APP_ENV == "production" ? '#_4Py^x@p>o+dWJ,.r7p' : 'connect19@123';

var appEmail = process.env.APP_ENV == "production" ? 'c19.olab@gmail.com' : 'c19.olab@gmail.com';
var appEmailPassword = process.env.APP_ENV == "production" ? '#_4Py^x@p>o+dWJ,.r7p' : '#_4Py^x@p>o+dWJ,.r7p';

module.exports = {
    appEmail: appEmail,
    appEmailPassword: appEmailPassword
}