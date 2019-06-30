

import React from 'react';
import Navbar from './Header';

class ScheduleSettings extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {};
  }

  render() {
    return (
      <div>
        <Navbar />
        <h1>Settings</h1>
      </div>
    );
  }
}

module.exports = ScheduleSettings;
