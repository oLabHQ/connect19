var dbUrl = process.env.APP_ENV == "production" ? 'mongodb://c19:connectnineteen19@ds123444.mlab.com:23444/connect19' : 'mongodb://c19:connect19@ds215502.mlab.com:15502/connect19';

module.exports = {
    // configure the code below with your username, password and mlab database information
    secret: 'connect19APIsecret',
    // database: 'mongodb://c19:connect19@ds215502.mlab.com:15502/connect19',  // staging
    // database: 'mongodb://c19:connectnineteen19@ds123444.mlab.com:23444/connect19' // prod
    database: dbUrl // dynamic
    //database: 'mongodb://localhost:27017/connect19'    //dev
  }