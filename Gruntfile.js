/*jshint node:true */
module.exports = function ( grunt ) {
	'use strict';

	grunt.loadNpmTasks( 'grunt-browserify' );
	grunt.loadNpmTasks( 'grunt-contrib-clean' );
	grunt.loadNpmTasks( 'grunt-contrib-copy' );
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-jsonlint' );
	grunt.loadNpmTasks( 'grunt-jscs' );
	grunt.loadNpmTasks( 'grunt-useref' );

	grunt.initConfig( {
		jshint: {
			options: {
				jshintrc: true
			},
			all: [
				'src/js/**/*.js',
				'!public/**'
			]
		},
		jscs: {
			src: '<%= jshint.all %>'
		},
		jsonlint: {
			all: [
				'**/*.json',
				'!public/**',
				'!node_modules/**',
			]
		},
		clean: [ 'public/**/*' ],
		copy: {
			main: {
				expand: true,
				cwd: 'src',
				src: [ '**', '!js/**/*' ],
				dest: 'public/'
			}
		},
		browserify: {
			dist: {
				files: {
					'public/js/map.js': [ 'src/js/map.js' ]
				}
			}
		},
		uglify: {
			bundle: {
				files: {
					'public/js/map.min.js': 'public/js/map.js'
				}
			}
		},
		useref: {
			html: 'public/index.html',
			temp: '/'
		}
	} );

	grunt.registerTask( 'test', [ 'jshint', 'jscs', 'jsonlint' ] );
	grunt.registerTask( 'build', [ 'test', 'clean', 'copy', 'browserify', 'uglify', 'useref' ] );
	grunt.registerTask( 'default', 'test' );
};
