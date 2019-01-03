/* eslint-env mocha */
'use strict'
/* globals testUtils */

var assert = require('assert')

var PouchDB = require('pouchdb')
const wait = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

describe('changes', function () {
  it('sequence', async () => {
    let docCount = 2
    let docs = testUtils.makeDocs(docCount)
    let remote = null
    let seq1 = ''
    let id; var rev

    return testUtils.createUser().then(function (remoteURL) {
      remote = new PouchDB(remoteURL)
      return remote.bulkDocs(docs)
    }).then(function () {
      // allow some time for the changes feed to reach our Envoy server
      // and for use to store the changes in sql-lite
      return wait(1000)
    }).then(function () {
      return remote.changes()
    }).then(function (response) {
      // testUtils.d('FIRST', response);
      assert(response.results)
      assert(response.results.length >= 1)
      seq1 = response.last_seq
      // Update a document
      let newDoc = testUtils.makeDocs(1)[0]
      newDoc._id = response.results[0].id
      newDoc._rev = response.results[0].changes[0].rev
      return remote.put(newDoc)
    }).then(function (response) {
      id = response.id
      rev = response.rev
      return wait(1000)
    }).then(function () {
      return remote.changes({ since: seq1 })
    }).then(function (response) {
      // testUtils.d('FINAL', response);
      assert.strictEqual(response.results.length, 1,
        'Changes feed should contain single entry')
      assert.strictEqual(response.results[0].id, id,
        'ID of document should be the one that was updated')
      assert.strictEqual(response.results[0].changes[0].rev, rev,
        'Rev of document should be the one that was updated')
    }).catch(function (error) {
      console.log(error)
      assert(false)
    })
  })

  it('changes with filter is not allowed', function () {
    var remote = null

    return testUtils.createUser().then(function (remoteURL) {
      remote = new PouchDB(remoteURL)
      return remote.changes({ filter: 'x' })
    }).then(function (r) {
      assert(false)
    }).catch(function (e) {
      assert.strictEqual(e.status, 403)
    })
  })
})
