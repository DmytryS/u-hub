import React from 'react'
import { Navbar } from 'react-bootstrap'
import { Link } from 'react-router-dom'

class Header extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}
  }

  render() {
    return (
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <Link to="/">Main</Link>
          </Navbar.Brand>
          <Navbar.Brand>
            <Link to="/scheduled_actions">Schedules</Link>
          </Navbar.Brand>
        </Navbar.Header>
      </Navbar>
    )
  }
}

module.exports = Header
