// Load plugins
var gulp = require('gulp'),
	uglify = require('gulp-uglify-es').default,
	plugins = require('gulp-load-plugins')({
		camelize: true
	}),
	plumber = require('gulp-plumber'),
	lr = require('tiny-lr'),
	server = lr(),
	del = require('del'),
	hashOpts = {
		deleteOld: true,
		sourceDir: __dirname + '/js/inc/dynamic'
	};


// PRE TASKS //
var copySources = ['node_modules/font-awesome/fonts/*'],
		copyDest = 'fonts/fontawesome/';
gulp.task('copy-files', function() {
	return gulp.src(copySources)
	.pipe(plumber())
  .pipe(gulp.dest(copyDest));
});

///// STYLES /////
/////
	// Main Styles
	gulp.task('main-style', function() {
	  return gulp.src('scss/style.scss')
		.pipe(plumber())
		.pipe(plugins.sass({ outputStyle: 'expanded'}).on("error", plugins.sass.logError))
		.pipe(plugins.sourcemaps.write())
		.pipe(plugins.autoprefixer('last 2 versions', 'ie 9', 'ios 6', 'android 4'))
		.pipe(gulp.dest('.'))
		.pipe(plugins.minifyCss({ keepSpecialComments: 1 }))
		// .pipe(plugins.livereload(server))
		// .pipe(gulp.dest('.'))
	});

	// Page specific styles
	gulp.task('page-styles', function() {
	  return gulp.src('scss/pages/*.scss')
		.pipe(plumber())
		.pipe(plugins.sass({ outputStyle: 'expanded'}).on("error", plugins.sass.logError))
		.pipe(plugins.sourcemaps.write())
		.pipe(plugins.autoprefixer('last 2 versions', 'ie 9', 'ios 6', 'android 4'))
		.pipe(gulp.dest('./css'))
		.pipe(plugins.minifyCss({ keepSpecialComments: 1 }))
		// .pipe(plugins.livereload(server))
		// .pipe(gulp.dest('./css'))
	});

///// END STYLES /////

///// JAVASCRIPT /////
// Clean out dynamic files
	gulp.task("clean-js", function () {
		return del([
			"./js/inc/dynamic/*"
		]);
	});
	// Before-the-fold scripts
	gulp.task('critical-js', ['clean-js'], function() {
	  return gulp.src(["node_modules/webfontloader/webfontloader.js", "js/modules/*"])
		.pipe(plumber())
		.pipe(plugins.concat('critical.js'))
		.pipe(plugins.hash())
		.pipe(plugins.rename({ suffix: '.min' }))
		.pipe(uglify())
		.pipe(gulp.dest('./js/inc/dynamic'))
	});

	// After-the-fold scripts
	gulp.task('noncritical-js', ["critical-js"], function() {
	  return gulp.src([
			"node_modules/tether/dist/js/tether.js",
			"node_modules/popper.js/dist/umd/popper.js",
			"node_modules/bootstrap/dist/js/bootstrap.js",
			"node_modules/slick-carousel/slick/slick.js",
			"js/google-map.js",
			"node_modules/galleria/src/galleria.js"
		])
		.pipe(plumber())
		.pipe(plugins.concat('noncritical.js'))
		.pipe(gulp.dest('./js'))
		.pipe(plugins.hash())
		.pipe(plugins.rename({ suffix: '.min' }))
		.pipe(uglify())
		.pipe(plugins.livereload(server))
		.pipe(gulp.dest('./js/inc/dynamic'))
		.pipe(plugins.hash.manifest('assets.json', hashOpts))
		.pipe(gulp.dest("./js"));
	});

	// Inline script injection
	gulp.task('inline-js', ["noncritical-js"], function() {
	  return gulp.src("js/inline/*.js")
		.pipe(plumber())
		.pipe(uglify())
		.pipe(plugins.livereload(server))
		.pipe(gulp.dest('./js/inc'));

	});

	// Site Scripts
	gulp.task('scripts', ["inline-js"], function() {
	  return gulp.src('js/source/*.js')
		.pipe(plumber())
		.pipe(plugins.jshint('.jshintrc'))
		.pipe(plugins.jshint.reporter('default'))
		.pipe(plugins.concat('scripts.js'))
		.pipe(gulp.dest('./js'))
		.pipe(plugins.hash())
		.pipe(plugins.rename({ suffix: '.min' }))
		.pipe(uglify())
		.pipe(plugins.livereload(server))
		.pipe(gulp.dest('./js/inc/dynamic'))
		.pipe(plugins.hash.manifest('assets.json', hashOpts))
		.pipe(gulp.dest("./js"));
	});

///// END JAVASCRIPT /////

// Watch
gulp.task('watch', function() {

  // Listen on port 35729
  server.listen(35729, function (err) {
		if (err) {
		  return console.log(err)
		};
		// Watch .scss files
		gulp.watch('scss/**/*.scss', ['main-style', "page-styles"]);

		// Watch .js files
		gulp.watch(['js/source/*.js', 'js/vendor/*.js', 'js/inline/*.js'], ['scripts']);
  }); 

});

// Default task
gulp.task('default', ["copy-files", "main-style", 'page-styles', 'scripts', 'watch']);
