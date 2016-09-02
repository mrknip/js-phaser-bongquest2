module.exports = function (grunt) {
  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    jshint: {
      all:['js/**/*.js'],
      options:{
        jshintrc: '.jshintrc',
        force: true
      }
    },
    
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
      "public/<%= pkg.name%>.js": ["js/index.js"]
    },

    connect: {
      server: {
        options: {
          port: 8000,
          liveReload: true
        }
      }
    },

    watch: {
      scripts: {
        files: ['./js/**/*.js'],
        tasks: ['browserify', 'uglify']
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('full-bong', [
    'jshint',
    'browserify', 
    'uglify',
    'connect',
    'watch'
  ]);

  grunt.registerTask('build', [
    'jshint',
    'browserify',
    'uglify'
  ]);

}