// const Nano = require('nano')
const access = require('../../access');
const app = require('../../../app.js')

// const nano = Nano(app.opts.couchHost)

const result = (ok, res, error, opts) => {
  return {
    ok,
    res,
    error,
    opts
  };
};

let db;


const LAST_SEQ = 'last_seq';
const DIV = '|';

// create the database tables and indicies
const setup = (dbName)=> {
  return new Promise((resolve, reject) => {
    app.cloudant.db.create(app.dbName+'_changes', (err, body, header) => {
      // 201 response == created
      // 412 response == already exists
      if (err || (header.statusCode !== 201 && header.statusCode !== 412)) {
        console.log(err || body)      
      }
      else {
        console.log( '[OK]  Created changes couch database: ' + dbName);
      }
      db = app.cloudant.db.use(app.dbName+'_changes');
      return resolve(true);
    });
  });
}

const processBatch = async (changes) => {
  console.log('-- ChangesDB: processBulk');  
  try {
    await insertBulk(changes);
    return true;
  }
  catch(err){
    console.log(err);
    return false;
  }

  
}

const insertBulk = async (changes) => {
  console.log('-- ChangesDB: changesInsertBulk');   
  try {

    const docs = [];

    changes.forEach(change => {
      const users = access.extractParticipants(change.doc);
      const deleted = (change.deleted)? 1: 0;
      const seq_num = parseInt(change.seq.split('-')[0]);

      users.forEach(user => {
        //changes docs, make one for each user
        docs.push({
              _id: 'change|'+user+DIV+seq_num,
              seq: change.seq,
              user: user,
              id: change.id, // store the original document id,
              changes: change.changes,
              deleted: deleted
        });
      })

      //cache docs
      docs.push({_id: 'doc'+DIV+change.doc._id, doc: change.doc});
    });

    docs.push({_id: LAST_SEQ, seq: changes[changes.length-1].seq})
    
    const res = await db.bulk({docs: docs});

    return true;
  }
  catch(err) {
    // if (!db.inTransaction) throw err; 
    console.log('Insert Bulk Error: ', err);
    return false;
  }
}





const loadChangesFromCouch = async (opts) => {
  try {
    const q = {
      selector: {
        '_id': {
          '$gte': 'change'+DIV+opts.user+DIV+opts.since,
          '$lte': 'change'+DIV+opts.user+DIV+'z', //find the last char code should be more encopasing
          },
        },
       'limit': Number(opts.limit)
    };
    console.log(q);
    const res = await db.find(q);
    console.log(res.docs);
    return res.docs;
  }
  catch(err){
    console.log(err);
    return false;
  }
}




// simulate a changes feed, segmented by user,
// given a 'since' and a 'user' and a 'limit'
const changes = async (opts) => {
  try {
    console.log('-- ChangesDB: Changes'); 

    if (typeof opts.since === 'undefined') { 
      opts.since = 0
    } else {
      const bits = opts.since.split('-')
      if (bits.length > 0) {
        opts.since = parseInt(bits[0])
      } else {
        opts.since = 0
      }
    }

    if (typeof opts.limit === 'undefined') {
      opts.limit = 100
    }

    console.log('OPTS: ', opts);
    
    const res = await loadChangesFromCouch(opts);

    console.log('RES: ', res);
    

    const seq = (res.length > 0)? res[res.length-1].seq : 0;
    //we also need to shift first element, since it will be duplicate
    if(opts.since != 0)
      res.shift(); //if its not init, then the first record will be dublicate

    const changeResults = {
      results: res,
      last_seq: seq,
      pending: 0 //TODO: test with over 100 docs, can record tell us how many pending
    }

    console.log('selected changes:: ');
    console.log(changeResults);
    return changeResults;
  }
  catch(err){
    console.log(err);
  }
    

}


// get the latest change from the changes feed database
const getSyncUserKey =  async (key) => {
  console.log('-- ChangesDB: getSyncUserKey'); 
  try{
    const row = await db.get(key);
    return row
  }
  catch(err){
    console.log(err);
    return result(false,null,err);
  }
}

// get the latest change from the changes feed database
const getLatestGlobalChangeSeq =  async (opts) => {
  console.log('-- ChangesDB: GetLatest'); 
  let since = 0;
  try{

    const row = await db.get(LAST_SEQ);
    since = row.seq;
    console.log('Since: ', since);
  }
  catch(err){
    if(err.error === 'not_found') 
      console.log('Last_Seq not found, must be new setup');
    else 
      console.log('getLatest: ', err);
  }
  return since;
}

module.exports = () => {
  return {
    setup,
    //changs
    changes,
    getLatestGlobalChangeSeq,

    //settings
    getSyncUserKey,

    //process
    processBatch
  };
}
