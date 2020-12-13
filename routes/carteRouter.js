"use strict";

var express = require('express');
var router = express.Router();
var bd_connexion = require('../bd_connexion');
//Middleware
var middleware = require('./middleware');

const mongoose = require('mongoose');
mongoose.connect(bd_connexion.bd_uri,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  });
const db = mongoose.connection;

//Models
var carteModel = require('../database/Carte');


router.get('/',middleware.checkToken, function(req,res){
   if(req.body.id == null)
   {
    carteModel.find(null, function(err,cartes){
      if (err) { throw err;}
      res.render('cartes', {cartes: cartes});
    });
   }
});

router.get('/creer',middleware.checkToken,function(req,res){
  res.render('creercarte_form');
});

router.get('/:id_carte',function(req, res){
  var id_carte = req.params.id_carte;

  carteModel.findById(id_carte, function(err,carte){
    if (err) {
      console.log(err);
    }else{
      res.render('carte', {carte: carte});
    }
  });
});

router.post('/', middleware.checkToken,function(req, res) {
    var carte = new carteModel({   
      cue:req.body.cue,
      show:req.body.show,
      rep:req.body.rep 
    });
  
    carte.save(function (err){
      console.log("dans le save");
      if(err){
        console.log(err);
      }
      else{
        console.log("Enregistré!");
        console.log(carte._id);
      }
      
      carteModel.find(null, function(err,cartes){
        if (err) { throw err;}
        res.render('cartes', {cartes: cartes});
      });
    });
  });

  
module.exports = router;