import { ApolloProvider } from '@apollo/react-hooks'
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route } from 'react-router-dom'
// import { createBrowserHistory } from 'history';

import SensorsList from './components/SensorsList'
import SchedulesActionsList from './components/ScheduledActionsList'
// import SensorSettings from './components/SensorSettings'
// import ScheduleSettings from './components/ScheduleSettings'

import { client } from './lib/fetch'
// const history = createBrowserHistory();

const App = () => (
  <ApolloProvider client={client}>
    <Router>
      <div>
        <Route exact path="/" component={SensorsList} />
        <Route path="/scheduled_actions" component={SchedulesActionsList} />
      </div>
    </Router>
  </ApolloProvider>
)

ReactDOM.render(<App />, document.getElementById('root'))
