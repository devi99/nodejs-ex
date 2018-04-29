var express = require('express');
var logger = require('morgan');
var catalog = require('./routes/catalog'); // Import routes for "catalog" area of site
var path = require('path');


// Create the Express application object
var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('combined'));
app.engine('html', require('ejs').renderFile);

app.use('/catalog', catalog); // Add catalog routes to middleware chain.

app.get('/pagecount', function (req, res) {
    // try to initialize the db on every request if it's not already
    // initialized.
    if (!db) {
      initDb(function(err){});
    }
    if (db) {
      db.collection('counts').count(function(err, count ){
        res.send('{ pageCount: ' + count + '}');
      });
    } else {
      res.send('{ pageCount: -1 }');
    }
  });
  
  // error handling
  app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500).send('Something bad happened!');
  });



module.exports = app ;


