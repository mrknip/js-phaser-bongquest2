module.exports = function (grunt) {
  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
      banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'public/<%= pkg.name%>.js',
        dest: 'public/<%= pkg.name %>.min.js'
      }
    },

    browserify: {
      dist: {
        files: {
          "public/<%= pkg.name%>.js": 
            [
              "js/index.js"
            ]
        }
      }

    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask('default', ['browserify', 'uglify']);

}