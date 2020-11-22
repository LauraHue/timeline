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

// Les models
var utilisateurModel = require('../database/Utilisateur');
var partieModel = require('../database/Partie');


/* POST : Créer une partie/des invitations */
router.post('/:id_utilisateur/parties', middleware.validerJoueurs, function (req, res, next) {

  //On va chercher l'utilisateur qui crée la partie afin de l'ajouter dans la partie
  var id_createur = req.params.id_utilisateur;
  var courriels = req.courriels;

  utilisateurModel.findById(id_createur, function (err, createur) {
    if (!err) {
      var invites = [createur.courriel];
      var partie = new partieModel({
        date: req.body.date,
        invites: invites,
        pioches: [],
        tapis: []
      });

     
      partie.save(function (err, partie) {
        if (!err) {
          //1 invité = 1 promesse
          var promises = [];
          for (var i = 0; i < courriels.length; i++) {
            promises.push(utilisateurModel.findOneAndUpdate({courriel:courriels[i]}, {$push: { invitations: partie._id } }));
          }
          //On résout toutes les promesses en parallèle
          Promise.all(promises).then((results)=>{
            results.filter(result => !result);
            var invites = [];
            //La variable results contient les utilisateurs trouvés
            results.forEach(r=>{
              invites.push(r.courriel);
            });
            console.log("Invitations envoyées!");
            res.send({ partie: partie, invites:invites });
          });
       
        }
      });//fin du save


    }
  });//Fin du findBy


});//Fin du POST


/*  PUT : Permet d'accepter une invitation   */
router.put('/:id_utilisateur/parties/:id_partie', function (req, res, next) {

  //Puisque le joueur accepte la partie, la partie n'a plus besoin de se trouver dans le joueur
  utilisateurModel.findByIdAndUpdate(req.params.id_utilisateur, { $pull: { invitations: req.params.id_partie } }).exec(function (err, utilisateur) {
    if (err) {
      throw err;
    }
    else{
      //Met à jour à jour la partie acceptée en ajoutant le nom de l'utilisateur
      //dans la partie
      partieModel.findByIdAndUpdate(req.params.id_partie, { $push: { invites: utilisateur.courriel } }).exec(function (err, res) {
        if (err) {
        throw err;
        }
      });
    }
  });

  partieModel.findById(req.params.id_partie, function(err,partie){
    res.send({partie: partie,id_util: req.params.id_utilisateur, id_partie: req.id_partie });
  });

  //res.redirect('/utilisateurs/'+req.params.id_utilisateur+'/parties');
});



/* GET : Obtenir une représentation de toutes les parties de l'utilisateur
(qu'il a crées +  celles où il est invité)*/
router.get('/:id_utilisateur/parties',middleware.checkToken, function (req, res, next) {


  //On va chercher l'utilisateur qui veut créer la partie afin de l'ajouter
  //dans la partie
  var id_utilisateur = req.params.id_utilisateur;


  utilisateurModel.findById(id_utilisateur, function (err, utilisateur) {
    if (err) {
      console.log(err);
    }
    else if (utilisateur != null) {
      console.log("pas d'erreur");
      //Promesse dans laquelle se trouve parties auxquelles l'utilisateur est
      ///invité (et qu'il n'a pas encore acceptées)
      var query = getParties(utilisateur.invitations);

      query.then(parties_toutes => {
        //Trouver les parties créées par l'utilisateur
        partieModel.find({ invites: { $elemMatch: utilisateur.courriel } }, function (err, parties) {
          if (!err && parties) {
            console.log(parties_toutes);
            for (var partie of parties) {
              parties_toutes.push(partie);
            }
            
          console.log(parties_toutes);
          res.send({ id: utilisateur.id, nom: utilisateur.nom, parties: parties_toutes });
          }
        });
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

