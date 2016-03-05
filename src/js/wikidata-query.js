var $ = require( 'jquery' );

function WikidataQuery() {

	var queryPrefixes = {
		wd: '<http://www.wikidata.org/entity/>',
		wdt: '<http://www.wikidata.org/prop/direct/>',
		wikibase: '<http://wikiba.se/ontology#>',
		p: '<http://www.wikidata.org/prop/>',
		rdfs: '<http://www.w3.org/2000/01/rdf-schema#>',
		psv: '<http://www.wikidata.org/prop/statement/value/>'
	};

	function buildSparql( itemQId ) {
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
			'LIMIT 100000';

		return buildPrefixes() + ' ' + sparql;
	}

	function buildPrefixes() {
		var prefixes = '';

		$.each( queryPrefixes, function( key, value ) {
			prefixes += 'PREFIX ' + key + ':' + value + ' ';
		} );

		return prefixes;
	}

	return {
		query: function( itemQId ) {
			var sparqlQuery = buildSparql( itemQId ),
				baseURI = 'https://query.wikidata.org/sparql',
				queryUrl = baseURI + '?query=' + encodeURIComponent( sparqlQuery ) + '&format=json';

			return $.ajax( {
				url: queryUrl,
				dataType: 'json'
			} );
		}
	};

}

module.exports = WikidataQuery;
