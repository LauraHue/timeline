"use strict";

var express = require('express');
var router = express.Router();

// Mongoose
var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://admin:admin123@timeline.9e4sd.mongodb.net/timeline?retryWrites=true&w=majority',
 { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true,useFindAndModify: false });
var db = mongoose.connection;

// Vérifier la connection
// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", function () {
//   console.log("Connexion réussie dans le router Utilisateur");
// });

// Les models
var utilisateurModel = require('../database/Utilisateur');
var partieModel = require('../database/Partie');


/*  Permet d'accepter une invitation   */
router.get('/:id_utilisateur/parties/:id_partie', function(req, res,next){

});



/* Permet de récupérer les parties de l'utilisateur*/
router.get('/:id_utilisateur/parties', function (req, res, next) {
  var id_utilisateur = req.params.id_utilisateur;

  utilisateurModel.findById(id_utilisateur, function (err, utilisateur) {
    if (err) {
      console.log(err);
    }
    else if (utilisateur != null) {

      var query = getParties(utilisateur.invitations);

      query.then(invitations => {
        for (var i = 0; i < invitations.length; i++) {
          invitations[i].date = new String(convertirDateTime(invitations[i].date));
          //invitations[i].date = convertirDateTime(invitations[i].date);
          //console.log(invitations[i].date + typeof(invitations[i].date));
          // dans la console : Tue Dec 01 2020 10:27:49 GMT-0500 (heure normale de l’Est)object
        }
 
        res.render('utilisateur_profil', { title: 'Timeline Online',nom: utilisateur.nom, invitations: invitations, aujourdhui: new Date() });
      });

    }
  });


});

// Fonction asynchrone pour aller chercher les parties dont l'id se trouve dans
// l'utilisateur
async function getParties(invitations) {
  var invitationsAffichables = [];

  for (var id_partie of invitations) {
    await partieModel.findById(id_partie, function (err, partie) {
      invitationsAffichables.push(partie);
    })
  }
  return invitationsAffichables;
}

// Fonction pour convertir la date et l'heure dans le format dd/mm/yy hh:mm
function convertirDateTime(datetime) {
  var datetimeFormate = "blabla" + datetime.getDate() + "/" + datetime.getMonth() + "/" + datetime.getFullYear() + " " + datetime.getHours() + ":" + datetime.getMinutes();
 // console.log("date formatte : " + datetimeFormate);
  //Dans la console : date formatte : 30/11/2020
  return datetimeFormate;
}

module.exports = router;

