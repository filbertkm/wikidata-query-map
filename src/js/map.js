( function() {

	var $ = require( 'jquery' ),
		L = require( 'leaflet' ),
		WikidataQuery = require( './wikidata-query.js' ),
		LabelLookup = require( './LabelLookup.js' );

	var linkBuilder = {

		makeItemLink: function( itemId, label ) {
			var itemUrl = 'https://www.wikidata.org/wiki/' + itemId,
				container = document.createElement( 'div' ),
				link = document.createElement( 'a' );

			link.setAttribute( 'href', itemUrl );
			link.appendChild( document.createTextNode( label ) );

			container.appendChild( link );

			return container;
		}

	};

	var InfoControl = L.Control.extend( {

		itemId: null,
		label: null,

		initialize: function( itemId, label, options ) {
			this.itemId = itemId;
			this.label = label;

			L.Util.setOptions( options );
		},

		onAdd: function( map ) {
			var itemLink = linkBuilder.makeItemLink( this.itemId, this.label );

			this._div = L.DomUtil.create( 'div', 'info-control' );
			this.update( itemLink.innerHTML );

			return this._div;
		},

		update: function ( label ) {
			this._div.innerHTML = label;
		}

	} );

	var view = {
		map: null,

		render: function() {
			var wikidataQuery = new WikidataQuery( $ );

			view.renderTileLayer();
			view.renderControlPanel( itemId );

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

		renderControlPanel: function( itemId ) {
			var labelLookup = new LabelLookup();

			labelLookup.get( itemId, 'en' )
				.done( function( res ) {
					var label = res.entities[itemId].labels.en.value;
						control = new InfoControl( itemId, label, {} );

					map.addControl( control );
				} );
		},

		renderMarkers: function( data ) {
			this.getMarkerGroup( data ).addTo( map );
		},

		getPopupHtml: function( result ) {
			var idPattern = /^http:\/\/www.wikidata.org\/entity\/([PQ]\d+)$/i,
				matches = result.item.value.match( idPattern ),
				qId = matches[1];

			return linkBuilder.makeItemLink( qId, result.name.value );
		},

		getMarkerGroup: function( data ) {
			var markers = [];

			$.each( data.results.bindings, function( key, result ) {
				markers.push(
					L.circle( [result.lat.value, result.lon.value], {
							radius: 10
						} )
						.bindPopup( view.getPopupHtml( result ) )
				);
			} );

			return L.featureGroup( markers ).setStyle( {
				color: '#ed2700',
				opacity: 0.9,
				fillColor: '#ed2700',
				fillOpacity: 0.9
			} );
		}
	};

	L.Icon.Default.imagePath = 'leaflet/images/';

	$( view.render );

} )();
