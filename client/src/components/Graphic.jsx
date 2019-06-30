

import React from 'react';
import { Label } from 'react-bootstrap';
import moment from 'moment';
import axios from 'axios';
import ReactHighcharts from 'react-highcharts';
import DateTimePicker from 'react-datetime-picker';

class Graphic extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      show: false,
      sensorData: [],
      fromDate: moment().subtract(6, 'hours'),
      toDate: moment(),
      highchartsConfig: {
        title: {
          text: '',
        },
        time: {
          timezoneOffset: new Date().getTimezoneOffset(),
        },
        xAxis: {
          type: 'datetime',
          labels: {
            format: '{value:%Y-%b-%e %H:%M:%S}',
          },
        },
      },
    };
  }

  async loadSensorData() {
    this.setState({
      highchartsConfig: Object.assign(this.state.highchartsConfig, {
        series: [{
          data: await axios.get(`/nodes/${this.props.sensor.nodeId}`
            + `/sensors/${this.props.sensor.sensorId}/type/${this.props.sensor.sensorType}`
            + `/values?fromDate=${this.state.fromDate.format('x')}&toDate=${this.state.toDate.format('x')}`)
            .then(result => result.data.map(point => [Date.parse(point.timestamp), point.value]))
            .catch((error) => { alert(error.response.data.details[0].message); return []; }),
          name: this.props.sensor.sensorType,
        }],
      }),
    });
  }

  componentWillMount() {
    this.setState({
      show: true,
      fromDate: moment().subtract(6, 'hours'),
      toDate: moment(),
    }, this.loadSensorData);
  }

  handleFromDate(newDate) {
    if (newDate) {
      this.setState({ fromDate: moment(newDate) }, this.loadSensorData);
    } else {
      this.setState({ fromDate: moment() }, this.loadSensorData);
    }
  }

  handleToDate(newDate) {
    if (newDate) {
      this.setState({ toDate: moment(newDate) }, this.loadSensorData);
    } else {
      this.setState({ toDate: moment() }, this.loadSensorData);
    }
  }

  render() {
    return (
      <div>
        <Label>From</Label>
        {' '}
        <DateTimePicker onChange={this.handleFromDate.bind(this)} value={this.state.fromDate.toDate()} />
        {'    '}
        <Label>To</Label>
        {' '}
        <DateTimePicker onChange={this.handleToDate.bind(this)} value={this.state.toDate.toDate()} />
        <ReactHighcharts config={this.state.highchartsConfig} ref={ref => this.chart = ref} />
      </div>
    );
  }
}

module.exports = Graphic;
