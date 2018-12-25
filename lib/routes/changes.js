const express = require('express')
const router = express.Router()
const app = require('../../app')
const auth = require('../auth')
const access = require('../access')
const changesdb = require('../changesdb.js')

// _changes
router.get('/' + app.dbName + '/_changes', auth.isAuthenticated, (req, res) => {


  console.log('_changes query: ', req.query);
  const query = req.query || {}
  console.log('Query.Filter:: ', query.filter);
  if (query.filter) {
    return auth.unauthorized(res); //no filter function implemented, YET :)
  }
  const id = access.calculateOwnerId(req.session.user.name)
  console.log('ID: ', id);
  changesdb.changes({ user: id, since: query.since, limit: query.limit }).then((data) => {
    data.spoolChangesProgress = app.spoolChangesProgress
    console.log('_changes data: ', data);
    res.send(data)

  })
})

module.exports = router
