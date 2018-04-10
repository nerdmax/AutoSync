// @flow
import path from 'path';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { remote } from 'electron';

import styles from './Home.css';

type Props = {};

export default class Home extends Component<Props> {
  props: Props;

  startSync = () => {
    const appPath =
      process.env.NODE_ENV === 'development'
        ? path.join(remote.app
          .getAppPath()
          .replace('node_modules\\electron\\dist\\resources\\default_app.asar', '/app'))
        : remote.app.getAppPath();
    const displayPanelViewPath = path.join(appPath, 'display-panel\\display-panel.html');
    console.log(appPath);
    console.log(displayPanelViewPath);

    const { BrowserWindow } = remote;
    const win = new BrowserWindow();
    win.loadURL(displayPanelViewPath);
  };

  render() {
    // console.log(electron.remote.app);
    // remote.app.setAppUserModelId('org.develar.ElectronReact');
    // const myNotification = new Notification('Title', {
    //   body: 'Lorem Ipsum Dolor Sit Amet'
    // });

    return (
      <div>
        <div className={styles.container} data-tid="container">
          <h2>Home</h2>
          <Link to="/counter">to Counter</Link>
          <button onClick={this.startSync}>Start</button>
        </div>
      </div>
    );
  }
}
