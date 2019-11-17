import React, { useState } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { Navbar, Button, Modal } from 'react-bootstrap'
import QRCode from 'qrcode.react'
import { Link } from 'react-router-dom'
import { QUERY_APPLE_HOME_KIT } from '../lib/fetch'

const Header = () => {
  const { loading, data } = useQuery(QUERY_APPLE_HOME_KIT)
  
  const [ showQRCode, setQRCodeShow ] = useState(false);

  const handleCloseQRCode = () => setQRCodeShow(false);
  const handleShowQRCode = () => setQRCodeShow(true);

  if (loading) {
    return (
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <Link to="/">Main</Link>
          </Navbar.Brand>
          <Navbar.Brand>
            <Link to="/scheduled_actions">Schedules</Link>
          </Navbar.Brand>
          <Navbar.Brand>
            <div>
              loading apple homekit info
            </div>
          </Navbar.Brand>
        </Navbar.Header>
      </Navbar>
    )
  }

  return (
    <div>
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <Link to="/">Main</Link>
          </Navbar.Brand>
          <Navbar.Brand>
            <Link to="/scheduled_actions">Schedules</Link>
          </Navbar.Brand>
          <Navbar.Brand>
            <div onClick={handleShowQRCode}>
              Connect Apple HomeKit
            </div>
          </Navbar.Brand>
        </Navbar.Header>
      </Navbar>
      <Modal show={showQRCode} onHide={handleCloseQRCode}>
        <Modal.Header closeButton>
          <Modal.Title>Scan QR code on your iPhone</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <QRCode value={data.appleHomeKit ? data.appleHomeKit.uri : false}/>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseQRCode}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Header
