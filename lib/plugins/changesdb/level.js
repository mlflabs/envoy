level = require('level')
const access = require('../../access');

let changesdb;
const LAST_SEQ = 'last_seq';
const DIVIDER = '|';

// create the database tables and indicies
const setup = (dbName) => {
  console.log('-- ChangesDB: Level Setup');
  changesdb = level(dbName, (res) =>{
    console.log('Leveldb connected: ', res);

    changesdb.createValueStream()
      .on('data', (data) => {
        console.log('value=', data)
        res.put(data);
    });
  });
}

// insert an array of changes into the changes database
// insert an array of changes into the changes database
const insertBulk = async (changes) => { 
  console.log('-- ChangesDB: InsertBulk');   
  try {
    //lets prep changes into correct format
    //seq, seq_num, user, id, changes, deleted
    changes.forEach(async change => {
      // extract the id of the user from the id of the document e.g. sue|abc123
      const user = access.extractOwnerId(change.id)
      const deleted = (change.deleted)? 1: 0;
      const seq_num = parseInt(change.seq.split('-')[0]);
      changesdb.batch().put( user+DIVIDER+seq_num,
      {
        seq: change.seq,
        seq_num: seq_num,
        user: user,
        id: access.removeOwnerId(change.id), // store the original document id,
        changes: JSON.stringify(change.changes),
        deleted: deleted
      });
    });
    //save the last row id for future syncs
    changesdb.batch().put(LAST_SEQ, changes[changes.length-1].seq);
    const res = await changesdb.batch().write();
    console.log('Changes: ', res, changes);
    return true;
  }
  catch(err) {
    // if (!db.inTransaction) throw err; 
    console.log('Insert Bulk Error: ', err);
    return false;
  }
}

// simulate a changes feed, segmented by user,
// given a 'since' and a 'user' and a 'limit'
const changes = (opts) => {
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
    let res = [];
    changesdb.createValueStream({ gte: opts.user+DIVIDER+opts.since, lte: opts.user+DIVIDER+'z', limit: opts.limit })
      .on('data', (data) => {
        console.log('value=', data)
        res.put(data);
    });

    console.log('RES: ', res);

    const changes = res.map(row => {
      let change =   {
        seq: row.seq,
        id: row.id,
        changes: JSON.parse(row.changes),
        user: row.user
      }
      if (row.deleted === 1) change.deleted = true;
      return change;
    });

    const changeResults = {
      results: changes,
      last_seq: formatedChanges[formatedChanges.length-1].seq,
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
