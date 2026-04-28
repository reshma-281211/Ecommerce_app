const MongoClient = require('mongodb').MongoClient;

const state = {
  db: null
};

module.exports.connect = function (done) {

  const url = "mongodb://localhost:27017";   // your MongoDB server
  const dbName = "shopping";                     // your database name

  MongoClient.connect(url)
    .then((client) => {
      state.db = client.db(dbName);   // ✅ VERY IMPORTANT
      done();
    })
    .catch((err) => {
      done(err);
    });
};

module.exports.get = function () {
  return state.db;
};