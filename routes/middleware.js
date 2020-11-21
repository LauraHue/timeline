var jwt = require('jsonwebtoken');
const secret = require('../secret.js');

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
  console.log("dans le middleware");
  // Vérifier si les crédences de l'utilisateur sont vides
  var courriel = req.body.courriel.trim();
  var mdp = req.body.mdp.trim();

  if (courriel==="" || mdp==="") {
    return res.send({
      success: false,
      message: "Obligatoire pour se connecter"
    });
  }
  else {
    //On peut passer à l'étape suivante : valider la combinaison courriel-mdp
    req.body.courriel = courriel;
    req.body.mdp = mdp;
    next();
  }
};


module.exports = {
  checkToken: checkToken,
  validerCredencesVides: validerSiCredencesVides
}