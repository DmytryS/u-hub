import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route } from "react-router-dom";
// import createBrowserHistory from 'history/createBrowserHistory'

import NodesList from "./components/NodesList";
import SchedulesList from "./components/SchedulesList";
import SensorSettings from "./components/SensorSettings";
import ScheduleSettings from "./components/ScheduleSettings";

const App = () => (
  <Router>
    <div>
      <Route exact path="/" component={NodesList} />
      <Route path="/schedules" component={SchedulesList} />
      <Route path="/schedules/:scheduleId" component={ScheduleSettings} />
      <Route
        path="/node/:nodeId/sensors/:sensorId/type/:type"
        component={SensorSettings}
      />
    </div>
  </Router>
);

ReactDOM.render(<App />, document.getElementById("root"));
