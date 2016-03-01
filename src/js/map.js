( function( $, L ) {

	var self = this;

	var queryApi = {

		queryPrefixes: {
			wd: '<http://www.wikidata.org/entity/>',
			wdt: '<http://www.wikidata.org/prop/direct/>',
			wikibase: '<http://wikiba.se/ontology#>',
			p: '<http://www.wikidata.org/prop/>',
			rdfs: '<http://www.w3.org/2000/01/rdf-schema#>',
			psv: '<http://www.wikidata.org/prop/statement/value/>'
		},

		buildSparql: function() {
			var sparql = 'SELECT DISTINCT ?item ?name ?lat ?lon WHERE { ' +
				'?item wdt:P131* wd:Q60 .' +
				'?item wdt:P31/wdt:P279* wd:Q33506 . ' +
				'?item p:P625 ?coordinate . ' +
				'?coordinate psv:P625 ?coordinate_node . ' +
				'?coordinate_node wikibase:geoLatitude ?lat . ' +
				'?coordinate_node wikibase:geoLongitude ?lon . ' +
					'SERVICE wikibase:label { ' +
						'bd:serviceParam wikibase:language "en" . ' +
						'?item rdfs:label ?name ' +
					'} ' +
				'} ' +
				'ORDER BY ASC (?name) ';

			var prefixes = '';

			$.each( this.queryPrefixes, function( key, value ) {
				prefixes += 'PREFIX ' + key + ':' + value + ' ';
			} );

			return prefixes + ' ' + sparql;
		},

		query: function() {
			var sparqlQuery = this.buildSparql(),
				baseURI = 'https://query.wikidata.org/sparql',
				queryUrl = baseURI + '?query=' + encodeURIComponent( sparqlQuery ) + '&format=json';

			$.ajax( {
				url: queryUrl,
				dataType: 'json'
			} )
			.done( function( res ) {
				view.addResults( res );
			} )
			.fail( function( jqXHR, textStatus ) {
				console.log( 'Request failed: ' + textStatus );
			} );
		}
	};

	var view = {
		map: null,

		render: function() {
			map = L.map( 'map', {
				center: [0, 0],
				zoom: 3
			} );

			queryApi.query();

			L.tileLayer( 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png', {
				attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
				maxZoom: 18
			} ).addTo( map );
		},

		addResults: function( data ) {
			var markers = [];

			$.each( data.results.bindings, function( key, result ) {
				var lat = result.lat.value,
					lon = result.lon.value;

				markers.push(
					L.marker( [lat, lon] ).bindPopup( result.name.value )
				);
			} );

			var markerGroup = L.featureGroup( markers );

			markerGroup.addTo( map );
			map.fitBounds( markerGroup.getBounds() );
		}
	};

	$( view.render );

} )( jQuery, L );
