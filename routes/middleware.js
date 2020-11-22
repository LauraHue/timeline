var jwt = require('jsonwebtoken');
const secret = require('../secret.js');

// Les models
var utilisateurModel = require('../database/Utilisateur');
var partieModel = require('../database/Partie');

// Sert à authentifier l'utilisateur lorsqu'il demande une page. Seuls les
// utilisateurs authentifier peuvent accéder aux ressources du site (sauf)
// les pages d'accueil, d'inscription et de connexion).

var checkToken = (req, res, next) => {
  var token = req.headers['x-access-token'] || req.headers['authorization'];

  if (token) {
    if (token.startsWith('Bearer ')) {
      // Nettoyage de la chaîne contenant le token
      token = token.slice(7, token.length);
    }

    jwt.verify(token, secret.secret, (err, decoded) => {
      if (err) {
        return res.json({
          success: false,
          message: 'Token is not valid'
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.json({
      success: false,
      message: 'Auth token is not supplied'
    });
  }
};

//Est utilisé lors du retour du formulaire de connexion
var validerSiCredencesVides = (req, res, next) => {
  // Vérifier si les crédences de l'utilisateur sont vides
  var courriel = req.body.courriel.trim();
  var mdp = req.body.mdp.trim();

  if (courriel === "" || mdp === "") {
    return res.send({
      success: false,
      message: "Courriel et mot de passe Obligatoires pour se connecter"
    });
  }
  else {
    //On peut passer à l'étape suivante : valider la combinaison courriel-mdp
    req.body.courriel = courriel;
    req.body.mdp = mdp;
    next();
  }
};

//Est utilisé lors de la création d'une partie/d'invitations
var validerNbJoueurs = (req, res, next) => {
  //Possibilité d'inviter 3 joueurs
  var courriel1 = req.body.courriel1.trim();
  var courriel2 = req.body.courriel2.trim();
  var courriel3 = req.body.courriel3.trim();

  console.log("courriel 1 = " + courriel1);
  console.log("courriel 2 = " + courriel2);
  console.log("courriel 3 = " + courriel3);

  var courriels = [];
  if (courriel1 !== "")
    courriels.push(courriel1);
  if (courriel2 !== "")
    courriels.push(courriel2);
  if (courriel3 !== "")
    courriels.push(courriel3);

  if (courriels.length < 1) {
    return res.send({
      success: false,
      message: "Il faut inviter au moins 1 joueur."
    });
  }
  else {
    //On valide les adresses courriel
    //   var valide=true;
    //   var i =0;

    // do{
    //   await utilisateurModel.findOne({courriel:courrielcourriels[i]}).exec();
    // }while(valide);



    //On peut passer à la création de la partie/des invitations
    // req.body.courriel1 = courriel1;
    // req.body.courriel2 = courriel2;
    // req.body.courriel3 = courriel3;

    var promises = [];
    console.log("juste avant le for, size = " + courriels.length);
    console.log(courriels);

    for (var i = 0; i < courriels.length; i++) {
      console.log(courriels[i]);
      promises.push(utilisateurModel.findOne({ courriel: courriels[i] }));
    }

    Promise.all(promises).then(
      (results) => {
        //results = results.filter(result => result);
        var courrielsValides = [];
        var valide = true;
        var i=0;
        do {
          console.log(results[i]);
          if (results[i] === null) {
            valide = false;
          }
          i++;
        } while (valide===true && i<results.length);

        if (valide ===true) {
          results.forEach(r => {
            courrielsValides.push(r.courriel);
          });
          req.courriels = courrielsValides;
          next();
        }
        else {
          return res.send({
            success: false,
            message: "Au moins 1 courriel est invalide."
          });
        }


      },
      (errors) => {
        console.log(errors);
      });


  }

};




module.exports = {
  checkToken: checkToken,
  validerCredencesVides: validerSiCredencesVides,
  validerNbJoueurs: validerNbJoueurs

}