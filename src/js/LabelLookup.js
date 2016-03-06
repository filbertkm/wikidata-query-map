var $ = require( 'jquery' );

function LabelLookup() {

	return {
		get: function( itemId, languageCode ) {
			var baseURI = 'https://www.wikidata.org/w/api.php',
				params = {
					action: 'wbgetentities',
					ids: itemId,
					props: 'labels',
					format: 'json'
				};

			return $.ajax( {
				url: baseURI,
				data: params,
				dataType: 'jsonp',
				jsonp: 'callback'
			} );
		}
	};

}

module.exports = LabelLookup;
