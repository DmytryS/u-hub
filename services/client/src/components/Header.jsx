import React, { useState } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { Nav, Button, Modal } from 'react-bootstrap'
import QRCode from 'qrcode.react'
import { Link } from 'react-router-dom'
import { QUERY_APPLE_HOME_KIT } from '../lib/fetch'

const Header = () => {
  const { loading, data } = useQuery(QUERY_APPLE_HOME_KIT)

  const [showQRCode, setQRCodeShow] = useState(false)

  const handleCloseQRCode = () => setQRCodeShow(false)
  const handleShowQRCode = () => setQRCodeShow(true)

  if (loading) {
    return (
      <Nav>
        <Nav.Item>
          <Link to="/">Main</Link>
        </Nav.Item>
        <Nav.Item>
          <Link to="/scheduled_actions">Schedules</Link>
        </Nav.Item>
        <Nav.Item>
          <div>
            loading apple homekit info
          </div>
        </Nav.Item>
      </Nav>
    )
  }

  return (
    <div>
      <Nav>
        <Nav.Item>
          <Link to="/">Main</Link>
        </Nav.Item>
        <Nav.Item>
          <Link to="/scheduled_actions">Schedules</Link>
        </Nav.Item>
        <Nav.Item onClick={handleShowQRCode}>
          Connect Apple HomeKit
        </Nav.Item>
      </Nav>
      <Modal show={showQRCode} onHide={handleCloseQRCode}>
        <Modal.Header closeButton>
          <Modal.Title>Scan QR code on your iPhone</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <QRCode value={data.appleHomeKit ? data.appleHomeKit.uri : 'apple home kit is not running'} />
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
