// @flow
import path from 'path';
import React, { Component } from 'react';
// import { Link } from 'react-router-dom';
import { remote } from 'electron';

import Radio, { RadioGroup } from 'material-ui/Radio';
import { FormLabel, FormControl, FormControlLabel } from 'material-ui/Form';

const jsonfile = require('jsonfile');

// import styles from './Home.css';

export default class Home extends Component<> {
  constructor(props) {
    super(props);
    this.appPath =
      process.env.NODE_ENV === 'development'
        ? path.join(remote.app
          .getAppPath()
          .replace('node_modules\\electron\\dist\\resources\\default_app.asar', '/app'))
        : remote.app.getAppPath();

    this.state = { projectConfigs: [], targetProjectName: '', targetProjectConfig: {} };
  }

  componentDidMount() {
    this.getProjectConfig();
  }

  getProjectConfig() {
    const configFilePath = path.join(this.appPath, '/config/config.json');
    jsonfile.readFile(configFilePath, (err, configFileObj) => {
      console.log(configFileObj);
      this.setState({ projectConfigs: configFileObj.config }, () => console.log(this.state));
    });
  }

  changeProjectName = event => {
    const targetProjectName = event.target.value;
    const targetProjectConfig = this.state.projectConfigs.find(projectConfig => projectConfig.projectName === targetProjectName);
    this.setState({ targetProjectName, targetProjectConfig }, () => console.log(this.state));
  };

  startSync = () => {
    const displayPanelViewPath = path.join(this.appPath, 'display-panel\\display-panel.html');
    const { BrowserWindow } = remote;
    let win = new BrowserWindow();
    win.loadURL(displayPanelViewPath);
    win.on('close', () => {
      win = null;
    });
    win.webContents.on('did-finish-load', () => {
      win.webContents.send('sendSettings', this.state.targetProjectConfig);
      win.maximize();
      win.webContents.openDevTools();
    });
    win.show();
  };

  render() {
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
        <FormControl component="fieldset" required>
          <FormLabel component="legend">Porject Names</FormLabel>
          <RadioGroup
            aria-label="porjectNames"
            name="porjectNames"
            value={this.state.targetProjectName}
            onChange={this.changeProjectName}
          >
            {this.state.projectConfigs.map(projectConfig => (
              <FormControlLabel
                value={projectConfig.projectName}
                control={<Radio />}
                label={projectConfig.projectName}
                key={projectConfig.projectName}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </div>
    );
  }
}
