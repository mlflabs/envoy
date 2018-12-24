const express = require('express')
const router = express.Router()
const auth = require('../auth')
const utils = require('../utils')
const access = require('../access')
const app = require('../../app')
const changesdb = require('../changesdb.js')

router.get('/' + app.dbName + '/_local/:key', auth.isAuthenticated, (req, res) => {




  app.cloudant.request({
    db: app.dbName,
    path: access.addOwnerId('_local/' + req.params.key, req.session.user.name)
  }, (err, data) => {
    if (err) {
      return utils.sendError(err, res)
    }
    console.log('get _local', access.strip(data));
    res.send(access.strip(data))
  })
})

router.put('/' + app.dbName + '/_local/:key', auth.isAuthenticated, (req, res) => {
  app.cloudant.request({
    db: app.dbName,
    path: access.addOwnerId('_local/' + req.params.key, req.session.user.name),
    method: 'PUT',
    body: req.body
  }, (err, data) => {
    if (err) {
      return utils.sendError(err, res)
    }
    console.log('put _local', access.strip(data));
    res.send(access.strip(data))
  })
})



router.get('/1' + app.dbName + '/_local/:key', auth.isAuthenticated, (req, res) => {
  app.cloudant.request({
    db: app.dbName,
    path: access.addOwnerId('_local/' + req.params.key, req.session.user.name)
  }, (err, data) => {
    if (err) {
      return utils.sendError(err, res)
    }
    console.log('get _local', access.strip(data));
    res.send(access.strip(data))
  })
})

router.put('/1' + app.dbName + '/_local/:key', auth.isAuthenticated, (req, res) => {
  app.cloudant.request({
    db: app.dbName,
    path: access.addOwnerId('_local/' + req.params.key, req.session.user.name),
    method: 'PUT',
    body: req.body
  }, (err, data) => {
    if (err) {
      return utils.sendError(err, res)
    }
    console.log('put _local', access.strip(data));
    res.send(access.strip(data))
  })
})

module.exports = router
