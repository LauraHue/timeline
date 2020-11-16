"use strict";

var express = require('express');
var router = express.Router();





var utilisateurModel = require('../database/Utilisateur');

/* GET home page. */
router.get('/', function (req, res, next) {
  // var query = utilisateurModel.find(null);
  // query.exec(function (err) {
  //   if (err) { throw err;}
  //   else {
  //     res.render('index', { title: 'Timeline Online', liste:utilisateurs });
  //   }
  // });
  res.render('index', { title: 'Timeline Online' });

});

module.exports = router;

