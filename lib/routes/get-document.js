const express = require('express')
const router = express.Router()
const app = require('../../app')
const access = require('../access')
const utils = require('../utils')
const auth = require('../auth')

router.get('/' + app.dbName + '/:id', auth.isAuthenticated, (req, res) => {
  //TODO: next version 
  return res.status(404).send({
    error: 'Not Found',
    reason: 'Feature not yet implemented'
  })
  

  // old code
  // 1. Get the document from the db
  // 2. Validate that the user has access
  // 3. return the document with the auth information stripped out
  const id = access.addOwnerId(req.params.id, req.session.user.name)
  app.db.get(id, (err, data) => {
    if (err) {
      return utils.sendError(err, res)
    }
    res.send(access.strip(data))
  })
})

module.exports = router
