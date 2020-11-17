"use strict";

var express = require('express');
var router = express.Router();

// Mongoose
var mongoose = require('mongoose');

mongoose.connect('mongodb+srv://admin:admin123@timeline.9e4sd.mongodb.net/timeline?retryWrites=true&w=majority',
 { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true,useFindAndModify: false });

var db = mongoose.connection;
//Vérifier la connection
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connection Successful!");
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
  //On vérifie si l'adresse courriel existe déjà dans la BD

  //var utilisateurModel = mongoose.model('Utilisateur', utilisateurSchema);

  // Création d'une instance du model Utilisateur
  var utilisateur = new utilisateurModel({
    nom: nom,
    mdp: mdp,
    courriel: courriel
  });

  // Sauvegarde du model, exécution d'un callcback
  utilisateur.save(function (err) {
    if (err) {
      if (err.name == 'ValidationError') {
        var erreursMessages = err.errors;
        for (let field in err.errors) {
          console.log(err.errors[field].message);
        }
      }

      res.render('signin_form', { title: 'Timeline Online', erreurs: erreursMessages });
      //res.end(erreursMessages);
    }
    else {
      console.log("Enregistré!");
      res.end("utilisateur enregistré : " + utilisateur.nom);
    }
    db.close();
  });




  // Si la validation est bonne, on connecte l'utilisateur et on renvoie sa page
  //(on utilise une nouvelle ressource?? l'URL va changer)



});
module.exports = router;