level = require('level')
const access = require('../../access');

let changesdb;
const LAST_SEQ = 'last_seq';
const DIVIDER = '|';

// create the database tables and indicies
const setup = (dbName) => {
  console.log('-- ChangesDB: Level Setup');
  changesdb = level(dbName);
  changesdb.on('put', function (key, value) {
    console.log('------- on inserted', { key, value })
  });
  changesdb.on('batch', function (res) {
    console.log('------- on batch', res.length);
  });
}

// insert an array of changes into the changes database
// insert an array of changes into the changes database
const insertBulk = async (changes) => { 
  console.log('-- ChangesDB: InsertBulk');   
  try {
    //lets prep changes into correct format
    //seq, seq_num, user, id, changes, deleted
    const batcharray = changes.map(change => {
      // extract the id of the user from the id of the document e.g. sue|abc123
      const user = access.extractOwnerId(change.id)
      const deleted = (change.deleted)? 1: 0;
      const seq_num = parseInt(change.seq.split('-')[0]);
      return { type: 'put',
               key:  user+DIVIDER+seq_num,
               value: JSON.stringify({
                      seq: change.seq,
                      seq_num: seq_num,
                      user: user,
                      id: access.removeOwnerId(change.id), // store the original document id,
                      changes: change.changes,
                      deleted: deleted
                })};
    });
    //save the last row id for future syncs
    batcharray.push({
      type: 'put',
      key: LAST_SEQ,
      value: changes[changes.length-1].seq
    });
    const res = await changesdb.batch(batcharray);
    //console.log('Changes: ', res, changes);
    return true;
  }
  catch(err) {
    // if (!db.inTransaction) throw err; 
    console.log('Insert Bulk Error: ', err);
    return false;
  }
}

const loadChangesFromLevel = (opts) => {
  return new Promise((resolve, reject) => {
    let res = [];
    changesdb.createValueStream({ gt: opts.user+DIVIDER+opts.since, lte: opts.user+DIVIDER+'z', limit: opts.limit })
      .on('data', (data) => {
          res.push(JSON.parse(data));
      })
      .on('error', err => {
        console.log('LEVEL Read error: ', err);
        return [];
      })
      .on('end', (data) => {
        console.log('END: ', data);
        return resolve(res);
      });
  });//end of promise
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
    
    const res = await loadChangesFromLevel(opts);

    console.log('RES: ', res);

    //seems like we don't need to format, its already correct
    /*const changes = res.map(doc => {
      let change =   {
        seq: doc.seq,
        id: doc.id,
        changes: doc.changes,
        user: doc.user
      }
      if (row.deleted === 1) change.deleted = true;
      
      return change;
    });*/

    const changeResults = {
      results: res,
      last_seq: res[res.length-1].seq,
      pending: 0
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
const getLatest =  async (opts) => {
  console.log('-- ChangesDB: GetLatest'); 
  let since = 0;
  try{
    const row = await changesdb.get(LAST_SEQ);
    since = row;
    console.log('Since: ', since);
  }
  catch(err){
    console.log('getLatest: ', err);
  }
  return since;
}

module.exports = () => {
  return {
    setup,
    changes,
    insertBulk,
    getLatest
  };
}
