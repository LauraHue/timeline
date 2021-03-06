"use strict";

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Pour utiliser Json Web Token
var jwt = require('jsonwebtoken');

// Création des handlers
var indexRouter = require('./routes/index');
var connexionRouter = require('./routes/connexionRouter');
var inscriptionRouter = require('./routes/inscriptionRouter');
var carteRouter = require('./routes/carteRouter');
var utilisateurRouter = require('./routes/utilisateurRouter');
var partieRouter = require('./routes/partieRouter');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Relie les URI aux handlers
app.use('/', indexRouter);
app.use('/connexion', connexionRouter);
app.use('/inscription', inscriptionRouter);
app.use('/cartes', carteRouter);
app.use('/utilisateurs', utilisateurRouter);
app.use('/parties',partieRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
