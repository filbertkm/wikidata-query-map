var express = require( 'express' );
var app = express();

app.use( express.static( 'public' ) );
app.set( 'view engine', 'jade' );

app.get( '/:id', function( req, res ) {
  res.render('index', {
    title: 'Wikidata Maps',
	itemId: req.params.id
  } );
} );

app.get( '/', function ( req, res ) {
  res.render('index', {
  	title: 'Wikidata Maps',
	itemId: 'Q33506'
  } );
} );

app.listen( 3000, function () {
  console.log( 'Example app listening on port 3000!' );
} );
