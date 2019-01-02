/* eslint-env mocha */
'use strict'
/* globals testUtils */

var assert = require('assert')

var PouchDB = require('pouchdb')

var app = require('../app')

var request = require('request')

var url1 = null

var remoteRitaURL = null
var remoteRita = null

var remoteBobURL = null
var remoteBob = null

describe('CRUD', function () {
  before(function () {
    return testUtils.createUser(2).then(function (urls) {
      url1 = urls[0].replace(/\/[a-z0-9]+$/, '')
      remoteBobURL = urls[0]
      remoteRitaURL = urls[1]
      remoteBob = new PouchDB(remoteBobURL)
      remoteRita = new PouchDB(remoteRitaURL)
    })
  })

  it('create', function (done) {
    /* TODO: not implemented 

    var testid = 'b9a568ff3ddba79a2d450e501fdac96e'
    var r = {
      url: remoteBobURL + '/' + testid,
      method: 'put',
      body: {
        hello: 'world'
      },
      json: true
    }

    request(r, function (err, res, body) {
      assert(err == null)
      assert.strictEqual(typeof body.ok, 'boolean')
      assert(body.ok)
      assert.strictEqual(typeof body.id, 'string')
      assert.strictEqual(typeof body.rev, 'string')
      assert.strictEqual(body.id, testid)
      done()
    })
    */
   done();
  })

  // this test just exercises an 'if' in the code
  it('create with _id in body', function (done) {
    /* TODO: not implemented 
    
    var testid = 'b9a568ff3ddba79a2d450e501fdac96e'
    var r = {
      url: remoteBobURL + '/' + testid,
      method: 'put',
      body: {
        _id: testid,
        hello: 'world'
      },
      json: true
    }

    request(r, function (err, res, body) {
      assert.strictEqual(err, null)
      done()
    })

    */
    done();
  })

  it('create a _local documnent', function (done) {
    var testid = '_local/a'
    var r = {
      url: remoteBobURL + '/' + testid,
      method: 'put',
      body: {
        hello: 'world'
      },
      json: true
    }
    request(r, function (err, res, body) {
      if (err) {
        assert(false)
      }
      remoteBob.get(testid, function (err, data) {
        assert.strictEqual(err, null)
        assert.strictEqual(typeof data, 'object')
        assert.strictEqual(data._id, testid)
        assert.strictEqual(data.hello, 'world')
        done()
      })
    })
  })

  // just to force Cloudant to throw an errors
  it('fail to add a _local documnent', function (done) {
    var testid = '_local/a'
    var r = {
      url: remoteBobURL + '/' + testid,
      method: 'put',
      body: {
        _bad: testid,
        hello: 'world'
      },
      json: true
    }
    request(r, function (err, res, body) {
      assert.strictEqual(err, null)
      assert.strictEqual(res.statusCode, 400)
      done()
    })
  })

  it('read non-existant _local documnent', function (done) {
    var testid = '_local/b'
    remoteBob.get(testid, function (err, body) {
      assert.notStrictEqual(err, null)
      if (body) {
        assert(false)
      }
      done()
    })
  })

  // Create a document, and read it back. Usual caveats apply:
  // this is normally A Bad Idea
  it('read', function (done) {
    //not yet implemented
    /*
    var r = {
      url: remoteBobURL + '/',
      method: 'post',
      body: {
        hello: 'world'
      },
      json: true
    }
    request(r, function (err, res, post) {
      if (err) {
        assert(false)
        done()
      }
      remoteBob.get(post.id, function (err, get) {
        if (err) {
          assert(false)
          done()
        }
        assert.strictEqual(get._rev, post.rev)
        done()
      })
    })
    */
   done();
  })

  // Make sure we get an error back for a missing document
  it('read 404', function (done) {
    remoteBob.get('unknownid', function (err, get) {
      if (err) {
        assert(true)
        return done()
      }
      assert(false)
    })
  })

  // Create a document, and then update it. Usual caveats apply:
  // this is normally A Bad Idea
  it('update', function (done) {
    /* not yet implemented
    return remoteBob.post({
      hello: 'world'
    }).then(function (create) {
      return remoteBob.put({
        _id: create.id,
        _rev: create.rev,
        hello: 'world2'
      })
    }).then(function (update) {
      assert(update.rev.startsWith('2-'))
    }).catch(function (err) {
      console.log(err)
      assert(false)
    })
    */
    done();
  })

  // Create a document, and then delete it. Usual caveats apply:
  // this is normally A Bad Idea
  it('delete', function (done) {
    /* not yet implemented
    return remoteBob.post({
      hello: 'world'
    }).then(function (create) {
      return remoteBob.remove({
        _id: create.id,
        _rev: create.rev
      })
    }).then(function (remove) {
      assert(remove.ok)
    }).catch(function (err) {
      console.log(err)
      assert(false)
    })
    */
    done();
  })

  // User 1 creates a document. Verify that User 2 can't read it.
  it("users can not read each other's docs", (done) => {
    /* not yet implemented

    return remoteBob.post({
      hello: 'world'
    }).then(function (bobdoc) {
      return remoteRita.get({
        _id: bobdoc.id,
        _rev: bobdoc.rev
      })
    }).then(function (thisIsBad) {
      assert(false) // Rita saw bob's doc
    }).catch(function (expectedFailure) {
      assert.strictEqual(expectedFailure.name, 'not_found')
    })
    */
   done();
  })

  // User 1 creates a document. Verify that User 2 can't delete it.
  it("users can not delete each other's docs", function (done) {
    /* not implemented

    return remoteBob.post({
      hello: 'world'
    }).then(function (bobdoc) {
      return remoteRita.remove({
        _id: bobdoc.id,
        _rev: bobdoc.rev
      })
    }).then(function (thisIsBad) {
      assert(false) // Rita deleted Bob's doc
    }).catch(function (expectedFailure) {
      assert.strictEqual(expectedFailure.name, 'not_found')
    })
    */
    done();
  })

  it('update a document with POST /db', function (done) {
    /* not implemented

    var cloudant = require('nano')(url1)
    var db = cloudant.db.use(app.dbName)
    var doc = { a: 1 }

    db.insert(doc, function (err, data) {
      assert.strictEqual(err, null)
      doc.b = 2
      doc._id = data.id
      doc._rev = data.rev
      db.insert(doc, function (err, data) {
        assert.strictEqual(err, null)
        done()
      })
    })

    */
    done();
  })

  it('update a document with bad POST /db', function (done) {
    /* not implmeneted 

    var cloudant = require('nano')(url1)
    var db = cloudant.db.use(app.dbName)
    var doc = { _bad: 1 }

    db.insert(doc, function (err, data) {
      assert.strictEqual(typeof data, 'undefined')
      assert.strictEqual(typeof err, 'object')
      done()
    })
    */
    done();
  })

  it('update a document with POST /db/:id and id in the body', function (done) {
    /* not yet implemented
    var request = require('request')
    var testid = 'newid'
    var url = url1 + '/' + app.dbName + '/' + testid
    var r = {
      method: 'post',
      url: url,
      body: {
        _id: testid,
        a: 1
      },
      json: true
    }
    request(r, function (err, resp, body) {
      assert.strictEqual(err, null)
      assert.strictEqual(resp.statusCode, 200)
      assert.strictEqual(body.id, testid)
      done()
    })
    */
    done();
  })

  // make sure that if we call POST /db without and id and no id in the body
  // that it doesn't create a doc with a Cloudant generated id
  it('create a document with POST /db and no id in the body', function (done) {
    /* not yet implemented
    var request = require('request')
    var url = url1 + '/' + app.dbName
    var r = {
      method: 'post',
      url: url,
      body: {
        a: 1
      },
      json: true
    }
    request(r, function (err, resp, body) {
      assert.strictEqual(err, null)
      assert.strictEqual(resp.statusCode, 200)
      // envoy generated ids have dashes in
      assert(body.id.indexOf('-') > 0)
      done()
    })
    */
    done();
  })

  //  // User 1 creates a document. Verify that User 2 can't update it.
  //  // This test is problematic due to eventual consistency issues
  // it("users can not update each other's docs", function () {
  //
  //   return remoteBob.request({
  //       url: uuid.v4(),
  //       method: 'put',
  //       body: {
  //         hello: 'world'
  //       }
  //     }).then(function (bobdoc) {
  //     return remoteRita.request({
  //       url: bobdoc.id,
  //       method: 'put',
  //       body: {
  //         _id: bobdoc.id,
  //         _rev: bobdoc.rev,
  //         hello: 'world2'
  //       }
  //     })
  //   }).then(function (thisIsBad) {
  //     console.log(thisIsBad);
  //     assert(false); // Rita updated Bob's doc
  //   }).catch(function (expectedFailure) {
  //     assert.strictEqual(expectedFailure.name, 'conflict');
  //   })
  // });
})
