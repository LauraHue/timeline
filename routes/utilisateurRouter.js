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



router.get('/:id_utilisateur/creerpartie', middleware.checkToken, function (req, res, next) {

  res.render('creerpartie_form', { id_utilisateur: req.params.id_utilisateur });
});

/* POST : Créer une partie/des invitations */
router.post('/:id_utilisateur/parties', middleware.checkToken, middleware.validerJoueurs, function (req, res, next) {

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
            promises.push(utilisateurModel.findOneAndUpdate({ courriel: courriels[i] }, { $push: { invitations: partie._id } }));
          }
          //On résout toutes les promesses en parallèle
          Promise.all(promises).then((results) => {
            results.filter(result => !result);
            var invites = [];
            //La variable results contient les utilisateurs trouvés
            results.forEach(r => {
              invites.push(r.courriel);
            });
            console.log("Invitations envoyées!");
            //res.send({ partie: partie, invites: invites });
            res.redirect('/utilisateurs/' + req.params.id_utilisateur + '/parties');

          });

        }
      });//fin du save


    }
  });//Fin du findBy


});//Fin du POST


/*  Permet d'accepter une invitation. Utilisation de router.use afin que toutes
    les requêtes pour cette URI doit dirigée ici.   */
router.use('/:id_utilisateur/parties/:id_partie', function (req, res, next) {

  //Puisque le joueur accepte la partie, la partie n'a plus besoin de se trouver dans le joueur
  utilisateurModel.findByIdAndUpdate(req.params.id_utilisateur, { $pull: { invitations: req.params.id_partie } }, function (err, utilisateur) {
    if (err) {
      throw err;
    }
    else {
      //Met à jour à jour la partie acceptée en ajoutant le nom de l'utilisateur
      //dans la partie
      partieModel.findByIdAndUpdate(req.params.id_partie, { $push: { invites: utilisateur.courriel } }, { new: true }, function (err, partie) {
        if (err) {
          throw err;
        }
        else {
          //res.send({partie: partie});
          res.redirect('/utilisateurs/' + req.params.id_utilisateur + '/parties');
        }
      });
    }
  });


});



/* GET : Obtenir une représentation de toutes les parties de l'utilisateur*/
router.get('/:id_utilisateur/parties', middleware.checkToken, function (req, res, next) {

  var d = new Date("July 21, 1983 01:15:00");
  var n = d.getUTCDate();
  console.log("d = "+d);
  console.log("n = "+n);
  
  //On va chercher l'utilisateur qui veut créer la partie afin de l'ajouter
  //dans la partie
  var id_utilisateur = req.params.id_utilisateur;


  utilisateurModel.findById(id_utilisateur, function (err, utilisateur) {
    if (err) {
      console.log(err);
    }
    else if (utilisateur != null) {
      //Promesse dans laquelle se trouve les parties auxquelles l'utilisateur est
      //invité (et qu'il n'a pas encore acceptées)
      var query = getParties(utilisateur.invitations);

      query.then(invitations => {

        //Trouver les parties créées par l'utilisateur
        partieModel.find({ "invites": { $elemMatch: { "$eq": utilisateur.courriel } } }, function (err, parties) {

          var parties_accept_affichables = [];
          if (!err && parties) {

            parties_accept_affichables.push(partie); 

            //Fonctionne, mais les dates sont fuckées
            // for (var partie of parties) {
            //   var delai = new Date(partie.date - (60000*5));
             
            //   console.log("delai = " + delai);
            //   console.log("datetime de la partie = "+partie.date);
            //   console.log("datetime now = " + new Date()) 
            //   console.log("  ");
            //   if(new Date() >= delai && new Date() <= partie.date){
            //     parties_accept_affichables.push(partie); 
                
            //   }
                        
            // }

            res.render('utilisateur_profil', {
              title: 'Timeline Online',
              id_utilisateur: req.params.id_utilisateur,
              nom: utilisateur.nom,
              invitations: invitations,
              parties_acceptees: parties_accept_affichables,
              aujourdhui: new Date()
            });

          }
        });


      });

    }
  });


});//Fin du GET

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

module.exports = router;

