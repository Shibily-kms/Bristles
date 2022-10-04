const mongoClient = require('mongodb').MongoClient
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);
const MongoURI = "mongodb://localhost:27017/sessions"


// Session Connection
const store = new MongoDBSession({
    uri: MongoURI,
    collection: 'Sessions'

})

module.exports.sessionSet = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 * 6 } // six months 
})



// Database Connection

const state = {
    db: null

}

module.exports.connect = function (done) {
    const url = process.env.DATABASE
    const dbname = 'Bristles'

    mongoClient.connect(url, (err, data) => {
        if (err) return done(err)
        state.db = data.db(dbname)
        done()
    })

}

module.exports.get = function () {
    return state.db

}