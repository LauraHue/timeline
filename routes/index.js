"use strict";

var express = require('express');
var router = express.Router();
var bd_connexion = require('../bd_connexion');

// Mongoose
var mongoose = require('mongoose');

mongoose.connect(bd_connexion.bd_uri,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  });
var db = mongoose.connection;
//Vérifier la connection
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connection Successful!");
});

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

