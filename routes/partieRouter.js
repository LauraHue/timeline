"use strict";

var express = require('express');
var router = express.Router();

// Mongoose
var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://admin:admin123@timeline.9e4sd.mongodb.net/timeline?retryWrites=true&w=majority',
 { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true,useFindAndModify: false });
var db = mongoose.connection;

// Les models
var utilisateurModel = require('../database/Utilisateur');
var partieModel = require('../database/Partie');

router.get('/',function(req,res){
    partieModel.find(null, function(err,parties){
        if (err) { throw err;}
        res.render('listepartie', {parties: parties});
      });
});

router.get('/:nom_utilisateur',function(req,res){
    res.render('creerpartie_form',{nom: req.params.nom_utilisateur});
});

router.post('/',function(req,res){
    var partie = new partieModel({
        date:req.body.date,
        invites:[],
        pioches: [],
        tapis:[]
    });

    partie.save();

    utilisateurModel.findOneAndUpdate({nom: req.body.nom},{$push: {invitations: partie._id}}).exec(function(err,res){
        if(err)
        {
            throw err;
        }
    });
    
    utilisateurModel.findOneAndUpdate({nom: req.body.nom1},{$push: {invitations: partie._id}}).exec(function(err,res){
        if(err)
        {
            throw err;
        }
    });
    
    utilisateurModel.findOneAndUpdate({nom: req.body.nom2},{$push: {invitations: partie._id}}).exec(function(err,res){
        if(err)
        {
            throw err;
        }
    });
    
    utilisateurModel.findOneAndUpdate({nom: req.body.nom3},{$push: {invitations: partie._id}}).exec(function(err,res){
        if(err)
        {
            throw err;
        }
    });
    
    res.render('creerpartie_form',{nom: req.body.nom});
});

module.exports = router;