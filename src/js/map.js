( function( L ) {

	var $ = require( 'jquery' ),
		WikidataQuery = require( './wikidata-query.js' );

	var view = {
		map: null,

		render: function() {
			var wikidataQuery = new WikidataQuery( $ );

			view.renderTileLayer();

			wikidataQuery.query( itemId )
				.done( function( res ) {
					view.renderMarkers( res );
				} )
				.fail( function( jqXHR, textStatus ) {
					console.log( 'Request failed: ' + textStatus );
				} );
		},

		renderTileLayer: function() {
			map = L.map( 'map', {
				center: [15, 0],
				zoom: 3
			} );

			L.tileLayer( 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png', {
				attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
				maxZoom: 18
			} ).addTo( map );
		},

		renderMarkers: function( data ) {
			this.getMarkerGroup( data ).addTo( map );
		},

		getPopupHtml: function( result ) {
			var container = document.createElement( 'div' ),
				idPattern = /^http:\/\/www.wikidata.org\/entity\/([PQ]\d+)$/i,
				matches = result.item.value.match( idPattern ),
				qId = matches[1],
				itemUrl = 'https://www.wikidata.org/wiki/' + qId,
				link = document.createElement( 'a' );

			link.setAttribute( 'href', itemUrl );
			link.appendChild( document.createTextNode( result.name.value ) );

			container.appendChild( link );

			return container.innerHTML + ' (' + qId + ')';
		},

		getMarkerGroup: function( data ) {
			var markers = [];

			$.each( data.results.bindings, function( key, result ) {
				var lat = result.lat.value,
					lon = result.lon.value;

				markers.push(
					L.circle( [lat, lon], 8, {
						color: '#ed2700',
						opacity: 0.9,
						fillColor: '#ed2700',
						fillOpacity: 0.9
					} ).bindPopup( view.getPopupHtml( result ) )
				);
			} );

			return L.featureGroup( markers );
		}
	};

	$( view.render );

} )( L );
