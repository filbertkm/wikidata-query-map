( function( $, L ) {

	var queryApi = {

		queryPrefixes: {
			wd: '<http://www.wikidata.org/entity/>',
			wdt: '<http://www.wikidata.org/prop/direct/>',
			wikibase: '<http://wikiba.se/ontology#>',
			p: '<http://www.wikidata.org/prop/>',
			rdfs: '<http://www.w3.org/2000/01/rdf-schema#>',
			psv: '<http://www.wikidata.org/prop/statement/value/>'
		},

		buildSparql: function( itemQId ) {
			var sparql = 'SELECT DISTINCT ?item ?name ?lat ?lon WHERE { ' +
				'?item wdt:P31 wd:' + itemQId + ' . ' +
				'?item p:P625 ?coordinate . ' +
				'?coordinate psv:P625 ?coordinate_node . ' +
				'?coordinate_node wikibase:geoLatitude ?lat . ' +
				'?coordinate_node wikibase:geoLongitude ?lon . ' +
					'SERVICE wikibase:label { ' +
						'bd:serviceParam wikibase:language "en" . ' +
						'?item rdfs:label ?name ' +
					'} ' +
				'} ' +
				'ORDER BY ASC (?name) ' +
				'LIMIT 5000';

			return this.buildPrefixes() + ' ' + sparql;
		},

		buildPrefixes: function() {
			var prefixes = '';

			$.each( this.queryPrefixes, function( key, value ) {
				prefixes += 'PREFIX ' + key + ':' + value + ' ';
			} );

			return prefixes;
		},

		query: function( itemQId ) {
			var sparqlQuery = queryApi.buildSparql( itemQId ),
				baseURI = 'https://query.wikidata.org/sparql',
				queryUrl = baseURI + '?query=' + encodeURIComponent( sparqlQuery ) + '&format=json';

			$.ajax( {
				url: queryUrl,
				dataType: 'json'
			} )
			.done( function( res ) {
				view.renderMarkers( res );
			} )
			.fail( function( jqXHR, textStatus ) {
				console.log( 'Request failed: ' + textStatus );
			} );
		}
	};

	var view = {
		map: null,

		render: function() {
			view.renderTileLayer();
			queryApi.query( itemId );
		},

		renderTileLayer: function() {
			map = L.map( 'map', {
				center: [0, 0],
				zoom: 3
			} );

			L.tileLayer( 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png', {
				attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
				maxZoom: 18
			} ).addTo( map );
		},

		renderMarkers: function( data ) {
			markerGroup = this.getMarkerGroup( data );

			map.fitBounds( markerGroup.getBounds() );
			markerGroup.addTo( map );
		},

		getMarkerGroup: function( data ) {
			var markers = [],
				idPattern = /^http:\/\/www.wikidata.org\/entity\/([PQ]\d+)$/i;

			$.each( data.results.bindings, function( key, result ) {
				var lat = result.lat.value,
					lon = result.lon.value,
					matches = result.item.value.match( idPattern ),
					qId = matches[1],
					itemUrl = 'https://www.wikidata.org/wiki/' + qId;

				var popupHtml = '<a href="' + itemUrl + '">' +
					result.name.value + '</a> (' + qId + ')';

				markers.push(
					// L.marker( [lat, lon] ).bindPopup( popupHtml )
					L.circle( [lat, lon], 8, {
						color: '#ed2700',
						opacity: 0.9,
						fillColor: '#ed2700',
						fillOpacity: 0.9
					} ).bindPopup( popupHtml )
				);
			} );

			return L.featureGroup( markers );
		}
	};

	$( view.render );

} )( jQuery, L );
