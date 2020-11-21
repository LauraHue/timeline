"use strict";

var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var secret = require('../secret');

// Mongoose
var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://admin:admin123@timeline.9e4sd.mongodb.net/timeline?retryWrites=true&w=majority',
 { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true,useFindAndModify: false });
var db = mongoose.connection;

// Vérifier la connection
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connexion réussie dans le router Connexion");
});

// Les models
var utilisateurModel = require('../database/Utilisateur');
var partieModel = require('../database/Partie');


/* Permet d'obtenir le formulaire de connexion*/
router.get('/', function (req, res, next) {
  res.render('login_form', { title: 'Timeline Online' });
});


/*  Retour du formulaire complété */
router.post('/', function (req, res) {

  // Validation les crédences de l'utilisateur
  var courriel = req.body.courriel.trim();
  var mdp = req.body.mdp.trim();


  utilisateurModel.findOne({ courriel: courriel, mdp: mdp }, function (err, utilisateur) {

    // Si l'utilisateur existe, on fait le ménage dans ses invitations
    if (!err && utilisateur) {
      //console.log(retirerInvitationsPerimees(utilisateur));
      //utilisateur.invitations = retirerInvitationsPerimees(utilisateur);

      //Pour résoudre la promesse retournée, il faut utiliser .then
      retirerInvitationsPerimees(utilisateur).then(
        function (result) {
          utilisateur.invitations = result;
          console.log("après : " + utilisateur.invitations);

          // Mettre à jour l'utilisateur
          utilisateurModel.findOneAndUpdate(utilisateur.id, { invitations: result }).exec(function (err, utilisateurModif) {
            if (!err)
              console.log("invitations mises à jour");
          });

           //Création du token d'authentification
           var token = jwt.sign({nom:utilisateur.nom}, secret.secret,{expiresIn:'24h'});
           res.setHeader('x-access-token', token);
          
           res.send({nom:utilisateur.nom, invitations:utilisateurModif.invitations});

          //res.redirect('utilisateurs/' + utilisateur.id + '/parties');
        },
        function (error) {
          console.log("err");
        }
      );


    }
    else {
      // Sinon on redirige vers la page de connexion avec un message d'erreur
      res.render('login_form', { title: 'Timeline Online', erreur: 'Courriel et mot de passe obligatoires' });
    }
  });
});


module.exports = router;



async function retirerInvitationsPerimees(utilisateur) {
  // Ménage des invitations du joueur : on conserve seulement les non périmées
  var invitationsValides = [];

  for (var id_partie of utilisateur.invitations) {
    await partieModel.findById(id_partie, function (err, partie) {

      if (partie != null && partie.date >= Date.now()) {
        invitationsValides.push(partie.id);
        //console.log("partie pushée" + partie.id);
      }
      else {
        console.log("La partie" + partie.id + "est périmée ou n'existe pas");
      }
    });

  }//fin foreach
  console.log("dans la fonction : " + invitationsValides)
  return invitationsValides;
}





