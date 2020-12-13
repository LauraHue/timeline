"use strict";

var express = require('express');
var router = express.Router();
var bd_connexion = require('../bd_connexion');


console.log(bd_connexion.bd_uri);
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


/* GET home page. */
router.get('/', function (req, res, next) {

  res.render('index', { title: 'Timeline Online' });

});

module.exports = router;

