/*
  CouchDB 2 will support the filtering of _all_docs by id, but
  unfortunately at the time of writing this is not implemented
  correctly for dbnext, hence the heath-robinson solution below.
*/

const express = require('express')
const router = express.Router()
const app = require('../../app')
const access = require('../access')
const utils = require('../utils')
const auth = require('../auth')





// use startkey and endkey to get all a user's docs
const getSelector = (ownerid, query) => {
  delete query.keys
  delete query.key
  query.startkey = access.addOwnerId('', ownerid)
  query.endkey = query.startkey.replace(access.delimiter, access.delimiter + 'z')
  query.descending = false
  console.log('GET selector query:  ', query);
  return query
}

router.get('/' + app.dbName + '/_all_docs', auth.isAuthenticated, (req, res) => {
  try{
    const keys = req.query.keys;
    // need to run access.addOwnerId(id, req.session.user.name)

    //const couchres = 
  }
  catch(err){
    console.log(err);
    //return utils.sendError(err, res);
  }


  if (req.query.keys) {
    // add ownerid to requested ids
    req.query.keys = JSON.parse(req.query.keys)
    req.query.keys = req.query.keys.map((id) => {
      return access.addOwnerId(id, req.session.user.name)
    })

    // return only the keys asked for
    app.db.listAsStream(req.query)
      .pipe(utils.liner())
      .pipe(access.authRemover(req.session.user.name))
      .pipe(res)
  } else {
    // use the primary index for range selection
    const selector = getSelector(req.session.user.name, req.query)
    app.db.listAsStream(selector)
      .pipe(utils.liner())
      .pipe(access.authRemover(req.session.user.name))
      .pipe(res)
  }
})

router.post('/' + app.dbName + '/_all_docs', auth.isAuthenticated, (req, res) => {
  try{
    const query = res.query;
    query['include_docs'] = true;
    const body = req.body.keys || getSelector(req.session.user.name, req.body);
    console.logy('query ', query);
    console.log('body', body);

    const couchres = app.cloudant.request({
      db: app.dbName,
      qs: req.query,
      path: '_all_docs',
      method: 'POST',
      body: body,
      stream: true
    });

    const couchres2 = utils.liner(couchres);
    console.log(couchres, couchres2);

    return res.send(couchres2);

  }
  catch(err){
    console.log(err);
    return utils.sendError(err, res);
  }
})











// use startkey and endkey to get all a user's docs
const getSelector2 = (ownerid, query) => {
  delete query.keys
  delete query.key
  query.startkey = access.addOwnerId('', ownerid)
  query.endkey = query.startkey.replace(access.delimiter, access.delimiter + 'z')
  query.descending = false
  return query
}

router.get('/2' + app.dbName + '/_all_docs', auth.isAuthenticated, (req, res) => {
  if (req.query.keys) {
    // add ownerid to requested ids
    req.query.keys = JSON.parse(req.query.keys)
    req.query.keys = req.query.keys.map((id) => {
      return access.addOwnerId(id, req.session.user.name)
    })

    // return only the keys asked for
    app.db.listAsStream(req.query)
      .pipe(utils.liner())
      .pipe(access.authRemover(req.session.user.name))
      .pipe(res)
  } else {
    // use the primary index for range selection
    const selector = getSelector(req.session.user.name, req.query)
    app.db.listAsStream(selector)
      .pipe(utils.liner())
      .pipe(access.authRemover(req.session.user.name))
      .pipe(res)
  }
})

router.post('/2' + app.dbName + '/_all_docs', auth.isAuthenticated, (req, res) => {
  req.query['include_docs'] = true
  let body = {}
  if (req.body.keys) {
    // add ownerid to requested ids
    body.keys = req.body.keys.map((id) => {
      return access.addOwnerId(id, req.session.user.name)
    })
  } else {
    body = getSelector(req.session.user.name, req.body)
  }

  app.cloudant.request({
    db: app.dbName,
    qs: req.query,
    path: '_all_docs',
    method: 'POST',
    body: body,
    stream: true
  }).pipe(utils.liner())
    .pipe(access.authRemover(req.session.user.name))
    .pipe(res)
})

module.exports = router
