import React, { useEffect, useState } from 'react'
import { Row, Col} from "react-bootstrap"

import logo from '../img/TREE-logo-animated.gif'

export const MainComponent = () => {
  return(
    <div className="mainComponent">
      <Row>
      <Col lg={2} md={1} sm={0} className="filler"></Col>
      <Col lg={8} md={1} sm={12} className="mainContent">
        <Row>
          <img src={logo} alt="loading..." />
        </Row>
      </Col>
      <Col lg={2} md={1} sm={0} className="filler"></Col>
      </Row>
    </div>
    )
}
