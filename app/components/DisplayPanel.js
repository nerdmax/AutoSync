import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from 'material-ui/styles';

const styles = {
  color: 'red'
};

class DisplayPanel extends Component<> {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes, targetProjectConfig } = this.props;

    return <div className={classes.color}>{targetProjectConfig.devBasePath}</div>;
  }
}

DisplayPanel.propTypes = {
  classes: PropTypes.object.isRequired,
  targetProjectConfig: PropTypes.object.isRequired,
};

export default withStyles(styles)(DisplayPanel);
