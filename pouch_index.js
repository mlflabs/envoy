/*require('dotenv').config()
const express = require('express');
const PouchDB = require('pouchdb')
const pouch = new PouchDB('./pouchdata/db');
const pouch_changes = new PouchDB('./pouchdata/changes');
const pouch_users = new PouchDB('./pouchdata/users');


pouch.put({
  _id: 'test',
  test:'test'
});




router = express.Router();
router.use('/db', require('express-pouchdb')(pouch))
router.use('/db_changes', require('express-pouchdb')(pouch_changes))
router.use('/db_users', require('express-pouchdb')(pouch_users))



//pouch.replicate.from(process.env.POUCH_HOST);
//pouch.replicate.to(process.env.POUCH_HOST);

const opts = {
  router: router,
  couchHost: 'http://localhost:'+process.env.PORT,
  databaseName:'db',
  userDatabaseName: 'db_users'
}



var envoy = require('./app')(opts);

*/


var PouchDB = require('pouchdb');
var express = require('express');
var app = express();

const port = process.env.PORT || 8000

app.use('/db', require('express-pouchdb')(PouchDB));

app.listen(port);
