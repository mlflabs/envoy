const express = require('express')
const router = express.Router()
const app = require('../../app')
const auth = require('../auth')
const access = require('../access')
const changesdb = require('../changesdb.js')
const utils = require('../utils')

// _changes
router.get('/' + app.dbName + '/_changes', auth.isAuthenticated, async (req, res) => {
  try {
    console.log('_changes query: ', req.query);
    const query = req.query || {}
    console.log('Query.Filter:: ', query.filter);
    if (query.filter) {
      return auth.unauthorized(res); //TODO: no filter function implemented, YET :)
    }
    
    const data = await changesdb.changes({ user:req.session.user.name, 
      since: query.since, 
      limit: query.limit 
    });
    
    data.spoolChangesProgress = app.spoolChangesProgress
    console.log('_changes data: ', data);
    return res.send(data)

  }
  catch(err){
    console.log(err);
    return utils.sendError(err, res)
  }
})

module.exports = router
