var stream = require('stream'),
  express = require('express'),
  auth = require('../../auth'),
  app = require('../../../app'),
	router = express.Router();

/*
  Testing, schema proposal

  "meta_access": {
    users: {
      "mike": {
        "r": true,
        "w": true
      }
    },
    channels: {
      test1: {
        "r": true,
        "w": true
      },
      test2: {
        "r": true,
        "w": true
      }
    }
  }

*/






// new vars
const canRead = (doc, owner) => {
   //see if its one of the users
   return true;
}

const canWrite = (doc, owner) => {

  return true;
}

const accessByUser = (doc, user) => {
  const id = user._id;
  if(!doc.meta_access || !doc.meta_access)

}



const accessByChannel = (doc, user) => {

}


const extractUsers = (doc) => {
  if(!doc.meta_access || !doc.meta_access.users) return [];
  return Object.keys(doc.meta_access.users);
}

const extractChannels = (doc) => {
  if(!doc.meta_access || !doc.meta_access.channels) return [];
  return Object.keys(doc.meta_access.channels);
}

const extractAccess = (doc) => {
  return {
    users: extractUsers(doc),
    channels: extractChannels(doc)
  };
}



// stream transformer that removes auth details from documents
var authCheckStream = function(onlyuser, removeDoc) {
  console.log('authRemover: ', onlyuser, removeDoc);
  var firstRecord = true;
  
  
  var stripAuth = function (obj, onlyuser, removeDoc) {
    console.log('stripAuth: ', obj, onlyuser, removeDoc);
    var addComma = false;
    var chunk = obj;

    // If the line ends with a comma, 
    // this would break JSON parsing.
    if (obj.endsWith(',')) {
      chunk = obj.slice(0, -1);
      addComma = true;
    }

    try { 
      var row = JSON.parse(chunk); 
    } catch (e) {
      return obj+'\n'; // An incomplete fragment: pass along as is.
    }

    // when simulating _all_docs with a view, we need to swap out
    // the key to equal the doc._id
    if (row.key && row.id && row.key !== row.id) {
      row.key = row.id;
    }

    // Successfully parsed a doc line. Remove auth field.
    if (row.doc) {      
      if (row.doc[app.opts.metaKey]) {
        var meta = row.doc[app.opts.metaKey];
        if (onlyuser && meta.ownerid && meta.ownerid !== onlyuser) {
          return '';
        }
        strip(row.doc);
      } else {
        // if doc has no metaKey, then it should not be returned
        return '';
      }
    } 
  
    // if we need to remove the doc object
    if (removeDoc) {
      delete row.doc;
    }
  
    // cloudant query doesn't return a .doc
    delete row[app.opts.metaKey];

    // Repack, and add the trailling comma if required
    var retval = JSON.stringify(row);
    if (firstRecord) {
      firstRecord = false;
      return retval+'';
    } else {
      return ',\n'+retval;
    }
  };
  
  var tr = new stream.Transform({objectMode: true});
  tr._transform = function (obj, encoding, done) {
    var data = stripAuth(obj, onlyuser, removeDoc);
    if (data) {
      this.push(data);
    }
    done();
  };
  return tr;
};


const validateAccessMeta = (doc) => {
  if(!doc.meta_access || !doc.meta_access.channels) return false;
  return true;
}



// strips a document of its ownership information
/*
var strip = function(doc) {
  console.log('Strip: ', doc);
  delete doc[app.opts.metaKey];
  return doc;
};
*/

// old docs

// adds owner id to an a document id
// e.g. dog becomes glynn-dog
/*
var addOwnerId = function(id, ownerid) {
  return id;
};

// removes ownerid from a document id
// e.g. glynn-dog becomes dog
var removeOwnerId = function(id) {
  return id;
};

var myId = function(id, ownerid) {
  return null;
};
*/

// determines whether a doc object is owned by ownerd
var isMine = function(doc, ownerid) {
  console.log('isMine: ', doc, ownerid);
  return (doc && doc[app.opts.metaKey] && doc[app.opts.metaKey].ownerid && 
            doc[app.opts.metaKey].ownerid === ownerid);
};



// adds 
/*
var addAuth = function(doc, ownerid) {
  doc[app.opts.metaKey] = { ownerid: ownerid};
  console.log('addAuth: ', doc);
  return doc;
};
*/

// depreciated
/*
const calculateOwnerId = (ownerid) => {
  return ownerid
}
*/




module.exports = function() {
  return {
    //new
    canWrite,
    canRead,
    extractParticipants,
    authCheckStream,
    extractAccess,

    // old
    // addOwnerId: addOwnerId,
    // removeOwnerId: removeOwnerId,
    // myId: myId,
    // isMine: isMine,
    // strip: strip,
    // addAuth: addAuth,
    // authRemover: authRemover,
    // routes: router,

    //depreciated
    calculateOwnerId,
  };
};
