'use strict';

module.exports = function (grunt) {
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		watch: {
			scripts: {
				files: ['js/*.js'],
				tasks: ['uglify'],
				options: {
					spawn: false,
				},
			},
			files: 'css/*.css',
			tasks: ['cssmin']
		},

        uglify: {
			dist: {
				files: {
					'app.min.js': ['src/js/*.js']
				}
			}
		},

		cssmin: {
			dist: {
				files: {
					'app.min.css': ['src/css/*.css']
				}
			}
		}
	});

	grunt.registerTask('default', 'watch');
};
