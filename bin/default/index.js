const path = require('path');
const express = require('express');


router = express.Router();

var PouchDB = require('pouchdb')
//require('dotenv').config()

const wait = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

// my custom route
router.get('/ok', async (req, res) => {
  res.send("ok");

  const nano = await require('nano')('http://mike:pass@localhost:5984');
  const couchdbs = await nano.db.list();
  couchdbs.forEach(async db=>{
    if(db.startsWith('envoy1')){
      await nano.db.destroy(db);
    }
  });

  nano.db.destroy('a');
  nano.db.destroy('a_changes');
});



var dbs = {}


router.get('/pull', async (req, res) => {
  try{
    dbs = { local: 'testdb', secondary: 'testdb2' }

    let local = new PouchDB(dbs.local)
    let docs = testUtils.makeDocs(5)
    let remoteURL = 'http://mike:pass@localhost:9000/a'; 
    let remote, response

    remote = new PouchDB(remoteURL)
    await remote.bulkDocs(docs)
    await wait(1000)
    await local.replicate.from(remote)
    await wait(1000)
    response = await local.allDocs({ include_docs: true });
    console.log(response)
    assert.strictEqual(response.total_rows, docs.length)
  }
  catch(err){
    console.log(err)
  }
});







var opts = {
    couchHost: 'http://mike:pass@localhost:5984',
    databaseName: 'a',
    usersDatabaseName: 'a_users',
    auth: 'default',
    access: 'meta',
    authTokenSecret: 'secret',
    authTokenLength: '1d',
    logFormat: 'dev',
    production: false, 
    port: 9000,
    static: path.join(__dirname, './public'),
    router: router
};
 
const envoy = require('../../app')(opts);
envoy.events.on('listening', function() {
  console.log('[OK]  Server is up');
});

const testUtils = require('../../test/utils');
   
