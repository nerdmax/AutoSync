// import { remote } from 'electron';

// console.log('aaaaaadfsdfd');

// // console.log(electron.remote.app);
// remote.app.setAppUserModelId('org.develar.ElectronReact');
// const myNotification = new Notification('Title', {
//   body: 'Lorem Ipsum Dolor Sit Amet'
// });

const _ = require('lodash');
const moment = require('moment');
const gulp = require('gulp');
const runSequence = require('run-sequence');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

const tap = require('gulp-tap');
const browserSync = require('browser-sync').create();
const path = require('path');
const streamCombiner = require('stream-combiner');
const watch = require('gulp-watch');
const gutil = require('gulp-util');
const ftp = require('vinyl-ftp');

const fs = require('fs');

require('electron').ipcRenderer.on('sendSettings', (event, message) => {
  const settings = message;

  // *Setup related files
  console.log('settings passed from main control panel', settings);
  // const { projectName } = settings;
  // console.log(projectName);
  // const configFile = path.join(__dirname, '/../config/config.json');
  // const allConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  // console.log('allConfig', allConfig);

  const config = settings.targetProjectConfig;
  console.log(config);

  const {
    cssFiles,
    cssBundleFile,
    jsFiles,
    jsBundleFile,
    cshtmlFiles,
    devBasePath,
    destPaths,
    uatpath,
    uatlaterpath,
    webUrl,
    browserSyncPortNO,
    infoWebPath,
    isSta,
    isUat,
    isUatLater
  } = config;

  const ftpConfig = settings.ftpConfigPath === '' ? {} : JSON.parse(fs.readFileSync(settings.ftpConfigPath, 'utf8'));

  // *Log out mode status and check whether user has specified sta/uat details
  let devmodeflag = true;
  // let isSta = argv.sta !== undefined ? true : false;

  // sta mode
  if (isSta) {
    devmodeflag = false;
    // if (stagingcompanyname == "") {
    // gutil.log(gutil.colors.green.bgWhite.bold("WARNING!!!!!!!!!!!!!!!!!!!!!!!!!!!: You tried to enter staging mode, but you didn't specify the stagingcompanyname"));
    // return false;
    // }
    gutil.log(gutil.colors.red('WARNING: You are in staging mode, changes of .CSS, .jS, .CShtml will be published to staging server, be careful!!!'));
  }
  // uat mode
  if (isUat) {
    devmodeflag = false;
    // if (publishfilename == "") {
    if (false) {
      gutil.log(gutil.colors.green.bgWhite.bold("WARNING!!!!!!!!!!!!!!!!!!!!!!!!!!!: You tried to publish files to uat server, but you didn't specify the publishfilename"));
      throw new Error('Something went badly wrong!');
    } else {
      gutil.log(gutil.colors.green.bgWhite.bold(`WARNING!!!!!!!!!!!!!!!!!!!!!!!!!!!: You are in ------UAT_REAL------ mode, files will be published directly to ${gutil.colors.magenta(uatpath)} be very very careful!!!`));
    }
  }
  // uat_later mode
  if (isUatLater) {
    devmodeflag = false;
    gutil.log(gutil.colors.green(`You are in uat_later mode, everything you changed will be copied into ${uatlaterpath}.You can use ${gutil.colors.magenta('gulp publishToServer')} to publish all files inside uatlater folder to uat server`));
  }
  // dev mode
  if (devmodeflag) {
    gutil.log(gutil.colors.green('You are in dev mode, everything you changed will only affect the local files, enjoy yourself :)'));
  }
  // Log out mode status end------------------------------------------------------------------

  const setupftp = () => {
    const UATConn = {
      host: ftpConfig.host,
      user: ftpConfig.user,
      password: ftpConfig.password,
      parallel: 1,
      log: gutil.log
    };
    gutil.log(gutil.colors.green('-------------------------------------------------'));
    gutil.log(gutil.colors.green(`FTP's HostAddress: ${UATConn.host}`));
    gutil.log(gutil.colors.green(`FTP's UserName: ${UATConn.user}`));
    gutil.log(gutil.colors.green('FTP connection has been set up successfully!!!'));
    gutil.log(gutil.colors.green('-------------------------------------------------'));

    return ftp.create(UATConn);
  };

  // Setup FTP--------------------------------------------------------------------------------
  let conn = gulp;
  // Set up FTP connection
  if (isUat) {
    conn = setupftp();
  }
  // Setup FTP end----------------------------------------------------------------------------

  const logOutput = (vinyl, destPath) => {
    let fileType = '';
    if (vinyl.extname.indexOf('css') !== -1) {
      fileType = 'CSS';
    } else if (vinyl.extname.indexOf('js') !== -1) {
      fileType = 'JS';
    } else {
      fileType = 'OTHERS';
    }
    const currentTime = moment().format('HH:mm:ss');
    console.log(`${currentTime} - ${fileType} - ((${vinyl.path})) -> ((${destPath}))`);
  };

  function dest(paths) {
    return streamCombiner(paths.map(streamPath => gulp.dest(streamPath)));
  }

  document.querySelector('#message').innerHTML = 'Watching files';

  gulp.task('processCSS', () => {
    const postcssPlugins = [
      autoprefixer({
        browsers: ['> 1%', 'last 2 versions']
      }),
      cssnano()
    ];
    // Concat & Minfiy & Hot reload
    return gulp
      .src(cssFiles, {
        base: devBasePath
      })
      .pipe(concat(path.basename(cssBundleFile)))
      .pipe(postcss(postcssPlugins))
      .pipe(gulp.dest(path.dirname(cssBundleFile)))
      .pipe(browserSync.reload({
        stream: true
      }));
  });

  gulp.task('processJS', () =>
    // Concat & Minfiy
    gulp
      .src(jsFiles, {
        base: devBasePath
      })
      .pipe(concat(path.basename(jsBundleFile)))
      .pipe(uglify())
      .pipe(gulp.dest(path.dirname(jsBundleFile))));

  gulp.task('publishToServer', () => {
    conn = setupftp();
    let totalFilesNO = 0;

    return gulp
      .src([`${uatlaterpath}**/*`], {
        base: uatlaterpath
      })
      .pipe(tap(file => {
        const ext = path.extname(file.path).substr(1); // remove leading "."
        if (ext) {
          totalFilesNO += 1;
          return gutil.log(gutil.colors.magenta(file.path));
        }
      }))
      .pipe(conn
        .dest(uatpath)
        .on('end', () =>
          gutil.log(gutil.colors.green(`Publish ${totalFilesNO} files to ${gutil.colors.magenta(uatpath)} Successfully!`))));
  });

  gulp.task('auto', () => {
    // Set up browserSync
    browserSync.init({
      proxy: webUrl, // makes a proxy for localhost:
      port: browserSyncPortNO
    });

    // Process CSS files
    watch(cssFiles, vinyl => {
      if (vinyl.event === 'change' || vinyl.event === 'add') {
        runSequence('processCSS', () => {
          // Only for BLC's CSS files
          if (infoWebPath !== '') {
            gulp
              .src(cssBundleFile, {
                base: devBasePath
              })
              .pipe(gulp.dest(infoWebPath))
              .on('end', () => logOutput(vinyl, infoWebPath));
          }
          // sta mode
          if (isSta) {
            gulp
              .src(cssBundleFile, {
                base: devBasePath
              })
              .pipe(dest(destPaths))
              .on('end', () => logOutput(vinyl, destPaths));
          }
          // uat mode
          if (isUat) {
            gulp
              .src(cssBundleFile, {
                base: devBasePath
              })
              // .pipe(conn.newer('/site/wwwroot/deploytest'))
              .pipe(conn.dest(uatpath))
              .on('end', () => logOutput(vinyl, uatpath));
          }
          // uat_later mode
          if (isUatLater) {
            gulp
              .src(cssBundleFile, {
                base: devBasePath
              })
              .pipe(gulp.dest(uatlaterpath))
              .on('end', () => logOutput(vinyl, uatlaterpath));
          }
        });
      }
    });

    // Process JS files
    watch(jsFiles, vinyl => {
      if (vinyl.event === 'change' || vinyl.event === 'add') {
        runSequence('processJS', () => {
          browserSync.reload();

          // sta mode
          if (isSta) {
            gulp
              .src(jsBundleFile, {
                base: devBasePath
              })
              .pipe(dest(destPaths))
              .on('end', () => logOutput(vinyl, destPaths));
          }
          // uat mode
          if (isUat) {
            gulp
              .src(jsBundleFile, {
                base: devBasePath
              })
              // .pipe(conn.newer('/site/wwwroot/deploytest'))
              .pipe(conn.dest(uatpath))
              .on('end', () => logOutput(vinyl, uatpath));
          }
          // uat_later mode
          if (isUatLater) {
            gulp
              .src(jsBundleFile, {
                base: devBasePath
              })
              .pipe(gulp.dest(uatlaterpath))
              .on('end', () => logOutput(vinyl, uatlaterpath));
          }
        });
      }
    });

    // Process cshtml files
    watch(cshtmlFiles, vinyl => {
      browserSync.reload();
      // Only for BLC's main.js files
      if (infoWebPath !== '') {
        if (vinyl.path.split('\\')[vinyl.path.split('\\').length - 1] === 'main.js') {
          gulp
            .src(vinyl.path, {
              base: devBasePath
            })
            .pipe(gulp.dest(infoWebPath))
            .on('end', () => logOutput(vinyl, infoWebPath));
        }
      }

      console.log(vinyl);
      if (vinyl.event === 'change' || vinyl.event === 'add') {
        // sta mode
        if (isSta) {
          gulp
            .src(vinyl.path, {
              base: devBasePath
            })
            .pipe(dest(destPaths))
            .on('end', () => logOutput(vinyl, destPaths));
        }
        // uat mode
        if (isUat) {
          gulp
            .src(vinyl.path, {
              base: devBasePath
            })
            // .pipe(conn.newer('/site/wwwroot/deploytest'))
            .pipe(conn.dest(uatpath))
            .on('end', () => logOutput(vinyl, uatpath));
        }
        // uat_later mode
        if (isUatLater) {
          gulp
            .src(vinyl.path, {
              base: devBasePath
            })
            .pipe(gulp.dest(uatlaterpath))
            .on('end', () => logOutput(vinyl, uatlaterpath));
        }
      }
    });
  });

  const publishToServerBtn = document.getElementById('publishToServerBtn');
  console.log(publishToServerBtn);
  publishToServerBtn.onclick = function () {
    console.log('CLICKED');
    gulp.start('publishToServer');
  };

  gulp.start('auto');
});
