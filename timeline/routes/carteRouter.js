"use strict";

var express = require('express');
var router = express.Router();


const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:/timeline', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
const db = mongoose.connection;

var carteModel = require('../database/Carte');
router.get('/',function(req,res){
   if(req.body.id == null)
   {
    carteModel.find(null, function(err,cartes){
      if (err) { throw err;}
      res.render('cartes', {cartes: cartes});
    });
   }
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

router.post('/', function(req, res) {
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
        res.render('creercarte_form');
      }
    });
  });

  
module.exports = router;