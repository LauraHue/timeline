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

var utilisateurModel = require('../database/Utilisateur');

/* Permet d'obtenir le formulaire de d'inscription*/
router.get('/', function (req, res, next) {

  res.render('signin_form', { title: 'Timeline Online' });

});

/*  Retour du formulaire complété   */
router.post('/', function (req, res) {

  // Récupération des paramètres dans le body
  var nom = req.body.nom.trim();
  var mdp = req.body.mdp.trim();
  var courriel = req.body.courriel.trim();

  // Vérifier l'adresse courriel
  if (courriel != null) {
    utilisateurModel.findOne({ courriel: courriel }, function (err, result) {
      if (err) {
        console.log(err);
      }
      else if(result != null){
        res.render('signin_form', { title: 'Timeline Online', erreur_courriel: "L'adresse courriel est déjà utilisée" });

      }
    });
  }

  // Création d'une instance du model Utilisateur
  var utilisateur = new utilisateurModel({
    nom: nom,
    mdp: mdp,
    courriel: courriel
  });

  // Sauvegarde du model, exécution d'un callcback
  utilisateur.save(function (err, utilisateur) {
    if (err) {
      if (err.name == 'ValidationError') {
        var erreursMessages = err.errors;
        for (let field in err.errors) {
          console.log(err.errors[field].message);
        }
      }

      res.render('signin_form', { title: 'Timeline Online', erreurs: erreursMessages });
     //res.send({erreurs:erreursMessages});
    }
    else {
      res.send({id:utilisateur._id, nom:utilisateur.nom, courriel:utilisateur.courriel});
    }
 
  });

});
module.exports = router;
