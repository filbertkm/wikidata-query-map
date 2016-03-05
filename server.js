var config = require( './config.json' ),
    express = require( 'express' ),
	app = express();

if ( process.env.TOOL_WEB_PORT != undefined ) {
  config.port = parseInt( process.env.TOOL_WEB_PORT, 10 );
}

app.use( config.basePath, express.static( 'public' ) );
app.set( 'view engine', 'jade' );

app.get( config.basePath + ':id', function( req, res ) {
  res.render( 'index', {
    title: 'Wikidata Maps',
	itemId: req.params.id,
	basePath: config.basePath
  } );
} );

app.get( config.basePath, function ( req, res ) {
  res.render( 'index', {
  	title: 'Wikidata Maps',
	itemId: 'Q33506',
	basePath: config.basePath
  } );
} );

app.listen( config.port, function () {
  console.log( 'Example app listening on port ' + config.port );
} );
