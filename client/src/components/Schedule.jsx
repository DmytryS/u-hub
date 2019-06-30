

import React from 'react';
import * as reactBootstrap from 'react-bootstrap';
import axios from 'axios';

class Schedule extends React.Component {
  constructor(...args) {
    super(...args);
  }

  componentDidMount() {

  }

  render() {
    return (
      <div>
        <span>{this.props.node.name}</span>
      </div>
    );
  }
}

module.exports = Node;
