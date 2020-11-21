"use strict";

var express = require('express');
var router = express.Router();

//Middleware
var middleware = require('./middleware');

// Mongoose
var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://admin:admin123@timeline.9e4sd.mongodb.net/timeline?retryWrites=true&w=majority',
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });
var db = mongoose.connection;

// Vérifier la connection
// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", function () {
//   console.log("Connexion réussie dans le router Utilisateur");
// });

// Les models
var utilisateurModel = require('../database/Utilisateur');
var partieModel = require('../database/Partie');


/* POST : Créer une partie/des invitations */
router.post('/:id_utilisateur/parties', middleware.validerNbJoueurs, function (req, res, next) {

  //On va chercher l'utilisateur qui crée la partie afin de l'ajouter dans la partie
  var id_createur = req.params.id_utilisateur;

  utilisateurModel.findById(id_createur, function (err, createur) {
    if (!err) {
      var partie = new partieModel({
        date: req.body.date,
        invites: [createur.courriel],
        pioches: [],
        tapis: []
      });

      partie.save(function (err, partie) {

        if (!err) {
          if (req.body.courriel1 !== "") {
            utilisateurModel.findOneAndUpdate({ courriel: req.body.courriel1 }, { $push: { invitations: partie._id } }).exec(function (err, invite1) {
              if (!err && invite1)
                res.send({ message: "L'adresse courriel de l'invité 1 n'existe pas." });
            });
          }
        }
      });//fin du save



      if (req.body.courriel2 !== "") {
        utilisateurModel.findOneAndUpdate({ courriel: req.body.courriel2 }, { $push: { invitations: partie._id } }).exec(function (err, invite2) {
          if (!err && invite2)
            res.send({ message: "L'adresse courriel de l'invité 2 n'existe pas." });
        });
      }
      if (req.body.courriel3 !== "") {

        utilisateurModel.findOneAndUpdate({ courriel: req.body.courriel3 }, { $push: { invitations: partie._id } }).exec(function (err, invite3) {
          if (!err && invite3)
            res.send({ message: "L'adresse courriel de l'invité 3 n'existe pas." });
        });

        res.send({ partie: partie });

      }//Fin du !err


    }
  });


});//Fin du POST


/*  PUT : Permet d'accepter une invitation   */
router.put('/:id_utilisateur/parties/:id_partie', function (req, res, next) {


  //Puisque le joueur accepte la partie, la partie n'a plus besoin de se trouver dans le joueur
  utilisateurModel.findByIdAndUpdate(req.params.id_utilisateur, { $pull: { invitations: req.params.id_partie } }).exec(function (err, res) {
    if (err) {
      throw err;
    }
  });

  //Met à jour à jour la partie acceptée en ajoutant le nom de l'utilisateur
  //dans la partie
  var partieModif;
  
  partieModel.findByIdAndUpdate(req.params.id_partie, partieModif ,{new: true}, { $push: { invites: req.params.id_utilisateur } }).exec(function (err, partieModif) {
    if (err) {
      throw err;
    }
    res.send({ partie: partieModif,id_util: req.params.id_utilisateur, id_partie: req.id_partie });
  });



  //res.redirect('/utilisateurs/'+req.params.id_utilisateur+'/parties');
});



/* GET : Obtenir une représentation de toutes les parties de l'utilisateur*/
router.get('/:id_utilisateur/parties', function (req, res, next) {

  //On va chercher l'utilisateur qui veut créer la partie afin de l'ajouter
  //dans la partie
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
        res.send({ id: utilisateur.id, nom: utilisateur.nom, invitations: invitations });
        //res.render('utilisateur_profil', { title: 'Timeline Online',id_utilisateur: req.params.id_utilisateur,nom: utilisateur.nom, invitations: invitations, aujourdhui: new Date() });
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

