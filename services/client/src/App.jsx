import { ApolloProvider } from '@apollo/react-hooks'
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import SensorsList from './components/SensorsList'
import SchedulesActionsList from './components/ScheduledActionsList'

import { client } from './lib/fetch'

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
