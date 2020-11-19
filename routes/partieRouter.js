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
        _id:8,
        date:res.date,
        invites:[],
        pioches: [],
        tapis:[]
    });
    utilisateurModel.find(null, function(err,utilisateur){
        if (err)
        {
        res.send(err);
        }
        else{
            utilisateur.update(
                {$or:[{nom: res.nom},
                    {nom: res.nom1},
                    {nom: res.nom2},
                    {nom: res.nom3}]
                },
                {$push: {invitations: req.params.id_partie}}
            );
        }
    });

    partie.save();
    res.render('creerpartie_form',{nom: res.nom});
});

module.exports = router;