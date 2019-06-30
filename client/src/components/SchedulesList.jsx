import React from 'react';
import {
  Grid,
  Row,
  Col,
  FormControl,
  Checkbox,
  Glyphicon,
  FormGroup,
  Button,
  ControlLabel,
  Panel,
} from 'react-bootstrap';
import axios from 'axios';
import cronParser from 'cron-parser';
import Header from './Header';
import ActioNodesList from './ActionNodesList';

class SchedulesList extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      newScheduleName: '',
      newCronString: '* * * * * *',
      newScheduleEnabled: true,
      schedules: [],
      showActionNodes: false,
    };
  }

  async loadSchedules() {
    this.setState({
      schedules: await axios
        .get('/scheduled-actions')
        .then(result => result.data),
    });
  }

  async componentDidMount() {
    await this.loadSchedules();
  }

  async handleCreateSchedule() {
    if (
      this.validateScheduleName(false) === 'success'
      && this.validateCronString(false) === 'success'
    ) {
      await axios
        .post('/scheduled-actions', {
          name: this.state.newScheduleName,
          schedule: this.state.newCronString,
          enabled: this.state.newScheduleEnabled,
        })
        .catch(err => alert(err.response.data.message));

      await this.loadSchedules();
    }
  }

  async updateSchedule(index) {
    if (
      this.validateScheduleName(index) === 'success'
      && this.validateCronString(index) === 'success'
    ) {
      const scheduleToUpdate = this.state.schedules[index];

      await axios.post(`/scheduled-actions/${scheduleToUpdate._id}`, {
        name: scheduleToUpdate.name,
        schedule: scheduleToUpdate.schedule,
        enabled: scheduleToUpdate.enabled,
      });
      await this.loadSchedules();
    }
  }

  async deleteSchedule(index) {
    const scheduleToDelete = this.state.schedules[index];

    await axios.delete(`/scheduled-actions/${scheduleToDelete._id}`);
    await this.loadSchedules();
  }

  handleEditName(index, e) {
    const { schedules } = this.state;
    schedules[index].name = e.target.value;
    this.setState({ schedules });
  }

  handleEditScheduleString(index, e) {
    const { schedules } = this.state;
    schedules[index].schedule = e.target.value;
    this.setState({ schedules });
  }

  handleEditEnabled(index, e) {
    const { schedules } = this.state;
    schedules[index].enabled = e.target.checked;
    this.setState({ schedules });
  }

  hanleShowActionNodes(index) {
    const { schedules } = this.state;
    schedules[index].showActionNodes = !schedules[index].showActionNodes;
    this.setState({ schedules });
  }

  validateCronString(index) {
    const cronString = index !== false
      ? this.state.schedules[index].schedule
      : this.state.newCronString;
    try {
      if (cronString.length === 0) {
        return 'error';
      }
      cronParser.parseExpression(cronString);
      return 'success';
    } catch (err) {
      return 'error';
    }
  }

  validateScheduleName(index) {
    const length = index !== false
      ? this.state.schedules[index].name.length
      : this.state.newScheduleName.length;
    if (length > 0) {
      return 'success';
    }
    return 'error';
  }

  render() {
    return (
      <div>
        <Header />
        <Grid>
          <Row>
            <Col sm={3} md={3}>
              <FormGroup validationState={this.validateScheduleName(false)}>
                <ControlLabel>Name</ControlLabel>
                {' '}
                <FormControl
                  type="text"
                  value={this.state.newScheduleName}
                  placeholder="Enter schedule name"
                  onChange={e => this.setState({ newScheduleName: e.target.value })
                  }
                />
              </FormGroup>
            </Col>
            <Col sm={3} md={3}>
              <FormGroup validationState={this.validateCronString(false)}>
                <ControlLabel>Schedule string</ControlLabel>
                {' '}
                <FormControl
                  type="text"
                  value={this.state.newCronString}
                  placeholder="Enter cron string"
                  onChange={e => this.setState({ newCronString: e.target.value })
                  }
                />
              </FormGroup>
              {' '}
            </Col>
            <Col sm={3} md={3}>
              <FormGroup>
                <ControlLabel>Enabled</ControlLabel>
                {' '}
                <Checkbox
                  checked={this.state.newScheduleEnabled}
                  onChange={e => this.setState({ newScheduleEnabled: e.target.checked })
                  }
                />
              </FormGroup>
            </Col>
            <Col sm={3} md={3}>
              <FormGroup>
                <br />
                <Button
                  bsStyle="success"
                  onClick={this.handleCreateSchedule.bind(this)}
                >
                  <Glyphicon glyph="plus" />
                </Button>
              </FormGroup>
            </Col>
          </Row>
        </Grid>
        {this.state.schedules.map((schedule, index) => (
          <Grid key={index}>
            <Row>
              <Col sm={3} md={3}>
                <FormGroup validationState={this.validateScheduleName(index)}>
                  <FormControl
                    type="text"
                    value={this.state.schedules[index].name}
                    placeholder="schedule name"
                    onChange={this.handleEditName.bind(this, index)}
                  />
                </FormGroup>
              </Col>
              <Col sm={3} md={3}>
                <FormGroup validationState={this.validateCronString(index)}>
                  <FormControl
                    type="text"
                    value={this.state.schedules[index].schedule}
                    placeholder="cron string"
                    onChange={this.handleEditScheduleString.bind(this, index)}
                  />
                </FormGroup>
              </Col>
              <Col sm={3} md={3}>
                <FormGroup>
                  <Checkbox
                    inline
                    checked={this.state.schedules[index].enabled}
                    onChange={this.handleEditEnabled.bind(this, index)}
                  />
                </FormGroup>
              </Col>
              <Col sm={3} md={3}>
                <Button
                  bsStyle="warning"
                  onClick={this.updateSchedule.bind(this, index)}
                >
                  <Glyphicon glyph="pencil" />
                </Button>
                {'    '}
                <Button
                  bsStyle="danger"
                  onClick={this.deleteSchedule.bind(this, index)}
                >
                  <Glyphicon glyph="trash" />
                </Button>
                {'    '}
                <Button
                  bsStyle="primary"
                  onClick={this.hanleShowActionNodes.bind(this, index)}
                >
                  <Glyphicon glyph="tasks" />
                </Button>
              </Col>
            </Row>
            <Panel
              expanded={this.state.schedules[index].showActionNodes}
              onToggle={() => {}}
            >
              <Panel.Collapse>
                <Panel.Body>
                  <ActioNodesList
                    emitter="SCHEDULE"
                    schedulerId={schedule._id}
                  />
                </Panel.Body>
              </Panel.Collapse>
            </Panel>
          </Grid>
        ))}
      </div>
    );
  }
}

module.exports = SchedulesList;
