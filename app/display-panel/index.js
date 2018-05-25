// TODO: Need to fix BlcWeb.staging is displaying an error after start sync
// import { remote } from 'electron';

// console.log('aaaaaadfsdfd');

// // console.log(electron.remote.app);
// remote.app.setAppUserModelId('org.develar.ElectronReact');
// const myNotification = new Notification('Title', {
//   body: 'Lorem Ipsum Dolor Sit Amet'
// });

// UI components
import React, { Component } from 'react';
import { render } from 'react-dom';
import DisplayPanel from '../components/DisplayPanel';

// Native components
// import * as _ from 'lodash';
import * as moment from 'moment';

const electron = require('electron');
const gulp = require('gulp');
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

electron.ipcRenderer.on('passInfo', (event, message) => {
  const info = message;

  class App extends Component<> {
    constructor(props) {
      super(props);

      // *Get related settings
      console.log('info passed from main control panel', info);
      const { targetProjectConfig, ftpConfigInfo } = info;

      const {
        cssFiles,
        cssBundleFile,
        jsFiles,
        jsBundleFile,
        cshtmlFiles,
        devBasePath,
        targetLocalPaths,
        targetFtpPath,
        scheduledPath,
        webUrl,
        browserSyncPortNO,
        syncLocal,
        syncFtp,
        syncScheduled
      } = targetProjectConfig;

      this.state = {
        targetProjectConfig
      };

      // *Log out mode status and check whether user has specified sta/uat details
      // sta mode
      if (syncLocal) {
        // if (stagingcompanyname == "") {
        // gutil.log(gutil.colors.green.bgWhite.bold("WARNING!!!!!!!!!!!!!!!!!!!!!!!!!!!: You tried to enter staging mode, but you didn't specify the stagingcompanyname"));
        // return false;
        // }
        gutil.log(gutil.colors.red('WARNING: You are in staging mode, changes of .CSS, .jS, .CShtml will be published to staging server, be careful!!!'));
      }
      // uat mode
      if (syncFtp) {
        // if (publishfilename == "") {
        if (false) {
          gutil.log(gutil.colors.green.bgWhite.bold("WARNING!!!!!!!!!!!!!!!!!!!!!!!!!!!: You tried to publish files to uat server, but you didn't specify the publishfilename"));
          throw new Error('Something went badly wrong!');
        } else {
          gutil.log(gutil.colors.green.bgWhite.bold(`WARNING!!!!!!!!!!!!!!!!!!!!!!!!!!!: You are in ------UAT_REAL------ mode, files will be published directly to ${gutil.colors.magenta(targetFtpPath)} be very very careful!!!`));
        }
      }
      // uat_later mode
      if (syncScheduled) {
        gutil.log(gutil.colors.green(`You are in uat_later mode, everything you changed will be copied into ${scheduledPath}.You can use ${gutil.colors.magenta('gulp publishToServer')} to publish all files inside uatlater folder to uat server`));
      }
      // Log out mode status end------------------------------------------------------------------

      const setupftp = () => {
        const UATConn = {
          host: ftpConfigInfo.host,
          user: ftpConfigInfo.user,
          password: ftpConfigInfo.password,
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
      if (syncFtp) {
        conn = setupftp();
      }
      // Setup FTP end----------------------------------------------------------------------------

      const logOutput = (vinyl, destPath) => {
        console.log('CALLING logOutput');
        let fileType = '';
        if (vinyl.extname.indexOf('css') !== -1) {
          fileType = 'CSS';
        } else if (vinyl.extname.indexOf('js') !== -1) {
          fileType = 'JS';
        } else {
          fileType = 'OTHERS';
        }
        const currentTime = moment.default().format('HH:mm:ss');
        console.log(`${currentTime} - ${fileType} - ((${vinyl.path})) -> ((${destPath}))`);
      };

      function dest(paths) {
        return streamCombiner(paths.map(streamPath => gulp.dest(streamPath)));
      }

      document.querySelector('#message').innerHTML = 'Watching files';

      const processCSS = callBackFn => {
        console.log('processCSS');
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
          .on('end', () => callBackFn());
      };

      const processJS = callBackFn => {
        console.log('processJS');
        return gulp
          .src(jsFiles, {
            base: devBasePath
          })
          .pipe(concat(path.basename(jsBundleFile)))
          .pipe(uglify())
          .pipe(gulp.dest(path.dirname(jsBundleFile)))
          .on('end', () => callBackFn());
      };

      const publishToServer = () => {
        conn = setupftp();
        let totalFilesNO = 0;

        return gulp
          .src([`${scheduledPath}**/*`], {
            base: scheduledPath
          })
          .pipe(tap(file => {
            const ext = path.extname(file.path).substr(1); // remove leading "."
            if (ext) {
              totalFilesNO += 1;
              return gutil.log(gutil.colors.magenta(file.path));
            }
          }))
          .pipe(conn
            .dest(targetFtpPath)
            .on('end', () =>
              gutil.log(gutil.colors.green(`Publish ${totalFilesNO} files to ${gutil.colors.magenta(targetFtpPath)} Successfully!`))));
      };

      const rootTask = () => {
        // Set up browserSync
        browserSync.init({
          proxy: webUrl, // makes a proxy for localhost:
          port: browserSyncPortNO
        });

        // Process CSS files
        watch(cssFiles, vinyl => {
          if (vinyl.event === 'change' || vinyl.event === 'add') {
            processCSS(() => {
              browserSync.reload('*.css');
              console.log('Calling callback function');
              // sta mode
              if (syncLocal) {
                console.log('css sta mode');
                gulp
                  .src(cssBundleFile, {
                    base: devBasePath
                  })
                  .pipe(dest(targetLocalPaths))
                  .on('end', () => logOutput(vinyl, targetLocalPaths));
              }
              // uat mode
              if (syncFtp) {
                gulp
                  .src(cssBundleFile, {
                    base: devBasePath
                  })
                  // .pipe(conn.newer('/site/wwwroot/deploytest'))
                  .pipe(conn.dest(targetFtpPath))
                  .on('end', () => logOutput(vinyl, targetFtpPath));
              }
              // uat_later mode
              if (syncScheduled) {
                gulp
                  .src(cssBundleFile, {
                    base: devBasePath
                  })
                  .pipe(gulp.dest(scheduledPath))
                  .on('end', () => logOutput(vinyl, scheduledPath));
              }
            });
          }
        });

        // Process JS files
        watch(jsFiles, vinyl => {
          if (vinyl.event === 'change' || vinyl.event === 'add') {
            processJS(() => {
              browserSync.reload();

              // sta mode
              if (syncLocal) {
                gulp
                  .src(jsBundleFile, {
                    base: devBasePath
                  })
                  .pipe(dest(targetLocalPaths))
                  .on('end', () => logOutput(vinyl, targetLocalPaths));
              }
              // uat mode
              if (syncFtp) {
                gulp
                  .src(jsBundleFile, {
                    base: devBasePath
                  })
                  // .pipe(conn.newer('/site/wwwroot/deploytest'))
                  .pipe(conn.dest(targetFtpPath))
                  .on('end', () => logOutput(vinyl, targetFtpPath));
              }
              // uat_later mode
              if (syncScheduled) {
                gulp
                  .src(jsBundleFile, {
                    base: devBasePath
                  })
                  .pipe(gulp.dest(scheduledPath))
                  .on('end', () => logOutput(vinyl, scheduledPath));
              }
            });
          }
        });

        // Process cshtml files
        watch(cshtmlFiles, vinyl => {
          console.log('processHtml');
          browserSync.reload();
          // console.log(vinyl);
          if (vinyl.event === 'change' || vinyl.event === 'add') {
            // sta mode
            if (syncLocal) {
              gulp
                .src(vinyl.path, {
                  base: devBasePath
                })
                .pipe(dest(targetLocalPaths))
                .on('end', () => logOutput(vinyl, targetLocalPaths));
            }
            // uat mode
            if (syncFtp) {
              gulp
                .src(vinyl.path, {
                  base: devBasePath
                })
                // .pipe(conn.newer('/site/wwwroot/deploytest'))
                .pipe(conn.dest(targetFtpPath))
                .on('end', () => logOutput(vinyl, targetFtpPath));
            }
            // uat_later mode
            if (syncScheduled) {
              gulp
                .src(vinyl.path, {
                  base: devBasePath
                })
                .pipe(gulp.dest(scheduledPath))
                .on('end', () => logOutput(vinyl, scheduledPath));
            }
          }
        });
      };

      const publishToServerBtn = document.getElementById('publishToServerBtn');
      console.log(publishToServerBtn);
      publishToServerBtn.onclick = function () {
        console.log('CLICKED');
        publishToServer();
      };

      rootTask();
    }

    render() {
      return <DisplayPanel targetProjectConfig={this.state.targetProjectConfig} />;
    }
  }

  // Setup view
  render(<App />, document.getElementById('displayPanelRoot'));
});
