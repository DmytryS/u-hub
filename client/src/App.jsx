import { ApolloProvider } from '@apollo/react-hooks'
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route } from 'react-router-dom'
// import { createBrowserHistory } from 'history';

import SensorsList from './components/SensorsList'
import SchedulesList from './components/SchedulesList'
import SensorSettings from './components/SensorSettings'
import ScheduleSettings from './components/ScheduleSettings'

import { client } from './lib/fetch'
// const history = createBrowserHistory();

const App = () => (
  <ApolloProvider client={client}>
    <Router>
      <div>
        <Route exact path="/" component={SensorsList} />
        <Route path="/schedules" component={SchedulesList} />
        <Route path="/schedules/:scheduleId" component={ScheduleSettings} />
        <Route
          path="/node/:nodeId/sensors/:sensorId/type/:type"
          component={SensorSettings}
        />
      </div>
    </Router>
  </ApolloProvider>
)

ReactDOM.render(<App />, document.getElementById('root'))
