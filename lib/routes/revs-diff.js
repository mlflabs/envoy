const express = require('express')
const router = express.Router()
const app = require('../../app')
const access = require('../access')
const utils = require('../utils')
const auth = require('../auth')

// Authenticated request to _revs_diff.
//
// Possible states per {docid, revid} tuple:
//
// 1. New document id that server has never seen:
//
//  Return {docid:{missing: [revid]}}
//
// 2. Existing docid where user has access to current leaf:
//
//  Return either {docid:{missing: [revid]}} or nothing depending on
//  whether it's present
//
// 3. Existing docid where user does not have access to current leaf:
//
//  Return {docid:{missing: [revid]}} (even though it is actuall NOT missing)
//
// The last state whilst not representing a leak at this point will
// result in a 401 for a subsequent POST, but this is true for a POST
// anyway (a.k.a 'winning the lottery').
//
// The Cloudant/Nano library does not support the revsDiff API end point
// directly, so we use the cloudant.request() call to roll our own.

/*
//from client new item
{"todotasks|0c64ec95-3ff0-4dac-8060-3075e5e5846d":
  {"missing":["1-9c0bfc9e6790b9c86753364bc022662d"]}}



  
*/
router.post('/' + app.dbName + '/_revs_diff', auth.isAuthenticated, (req, res) => {
  // replace add ownerids to incoming ids
  let newBody = { }
  Object.keys(req.body).forEach((k) => {
    const newkey = access.addOwnerId(k, req.session.user.name)
    newBody[newkey] = req.body[k]
  })

  // Now we can revs_diff
  // TODO::: here we can load from cache
  app.cloudant.request({
    db: app.dbName,
    path: '_revs_diff',
    method: 'POST',
    body: newBody
  }, (err, body) => {
    if (err) {
      return utils.sendError(err, res)
    }

    // remove ownerid from ids
    newBody = { }
    Object.keys(body).forEach((k) => {
      const newkey = access.removeOwnerId(k)
      newBody[newkey] = body[k]
    })
    console.log('_revs_diff', newBody);
    res.send(newBody)
  })
})

module.exports = router
