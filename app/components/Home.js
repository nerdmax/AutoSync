// @flow
import path from 'path';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { Link } from 'react-router-dom';
import { remote } from 'electron';

import { withStyles } from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';
import Radio, { RadioGroup } from 'material-ui/Radio';
import { FormControlLabel } from 'material-ui/Form';
import Button from 'material-ui/Button';

import ReactJson from 'react-json-view';

const fs = require('fs');

const styles = {
  projectContainer: {
    textAlign: 'center'
  },
  projectList: {
    flexDirection: 'row'
  },
  projectItem: {}
};

// import styles from './Home.css';

class Home extends Component<> {
  constructor(props) {
    super(props);
    this.appPath =
      process.env.NODE_ENV === 'development'
        ? path.join(remote.app
          .getAppPath()
          .replace('node_modules\\electron\\dist\\resources\\default_app.asar', '/app'))
        : remote.app.getAppPath();
    console.log('remote.app.getAppPath()', remote.app.getAppPath());
    console.log('this.appPath', this.appPath);
    this.state = { projectConfigs: [], targetProjectName: '', targetProjectConfig: {} };
  }

  componentDidMount() {
    this.getProjectConfig();
  }

  getProjectConfig() {
    const configFilePath = path.join(this.appPath, 'config/config.json');
    fs.readFile(configFilePath, 'utf8', (err, configFileData) => {
      if (err) {
        console.error('read file error', err);
      }
      try {
        const configFileObj = JSON.parse(configFileData);
        console.log(configFileObj);
        this.setState({ projectConfigs: configFileObj.config }, () => console.log(this.state));
      } catch (error) {
        console.error('parse json error', error);
      }
    });
  }

  changeProjectName = event => {
    const targetProjectName = event.target.value;
    const targetProjectConfig = this.state.projectConfigs.find(projectConfig => projectConfig.projectName === targetProjectName);
    this.setState({ targetProjectName, targetProjectConfig }, () => console.log(this.state));
  };

  startSync = () => {
    const displayPanelViewPath = path.join(this.appPath, 'display-panel/display-panel.html');
    const { BrowserWindow } = remote;
    const { targetProjectConfig } = this.state;
    let ftpConfigInfo = {};
    console.log('output targetProjectConfig.projectName', targetProjectConfig.projectName);
    if (this.state.targetProjectConfig.ftpConfig !== '') {
      const ftpConfigPath = path.join(
        this.appPath,
        `config/${this.state.targetProjectConfig.ftpConfig}`
      );
      ftpConfigInfo = JSON.parse(fs.readFileSync(ftpConfigPath, 'utf8'));
    }
    let win = new BrowserWindow({
      title: targetProjectConfig.projectName
    });
    console.log('output targetProjectConfig.projectName', targetProjectConfig.projectName);
    win.loadURL(displayPanelViewPath);
    win.on('close', () => {
      win = null;
    });
    win.webContents.on('did-finish-load', () => {
      win.webContents.send('passInfo', {
        targetProjectConfig,
        ftpConfigInfo
      });
      win.maximize();
      win.webContents.openDevTools();
    });
    win.show();
  };

  render() {
    const { classes } = this.props;
    // console.log(electron.remote.app);
    // remote.app.setAppUserModelId('org.develar.ElectronReact');
    // const myNotification = new Notification('Title', {
    //   body: 'Lorem Ipsum Dolor Sit Amet'
    // });

    return (
      // <div>
      //   <div className={styles.container} data-tid="container">
      //     <h2>Home</h2>
      //     <Link to="/counter">to Counter</Link>
      //     <button onClick={this.startSync}>Start</button>
      //   </div>
      // </div>
      <div>
        <Grid container spacing={8}>
          <Grid item md={12}>
            <Paper className={classes.projectContainer}>
              <RadioGroup
                aria-label="porjectNames"
                name="porjectNames"
                value={this.state.targetProjectName}
                onChange={this.changeProjectName}
                className={classes.projectList}
              >
                {this.state.projectConfigs.map(projectConfig => (
                  <FormControlLabel
                    value={projectConfig.projectName}
                    control={<Radio />}
                    label={projectConfig.projectName}
                    key={projectConfig.projectName}
                    className="project-item"
                  />
                ))}
              </RadioGroup>
              <Button variant="raised" onClick={this.startSync}>
                Start Sync!
              </Button>
            </Paper>
          </Grid>
          <Grid item md={12}>
            <Paper>
              <ReactJson src={this.state.targetProjectConfig} displayDataTypes={false} />
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Home);
