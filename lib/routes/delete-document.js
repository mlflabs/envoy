const express = require('express')
const router = express.Router()
const app = require('../../app')
const access = require('../access')
const utils = require('../utils')
const auth = require('../auth')

// Delete a document
router.delete('/' + app.dbName + '/:id', auth.isAuthenticated, (req, res) => {
  //TODO: next version 
  return res.status(404).send({
    error: 'Not Found',
    reason: 'Feature not yet implemented'
  })
  

  // old code
  const id = access.addOwnerId(req.params.id, req.session.user.name)
  app.db.destroy(id, req.query.rev, (err, data) => {
    if (err) {
      utils.sendError(err, res)
      return
    }
    res.send(access.strip(data))
  })
})

module.exports = router
