
import { Row, Col, Button } from 'react-bootstrap'
import React, { useEffect, useState } from 'react'
import { useHistory } from "react-router-dom";
import { availableViews } from '../util/Util'

export const Navigation = () => {
  var history = useHistory();

  const navigate = (view) => {
    if (view.newtab) {
      window.location.href = view.target
    } else {
      const route = view.target
      history.push(route);
    }
  }
  return (
    <Row className="navigation">
      {Object.values(availableViews).map((view, index) => {
        return (
          <div className={index==0 ? "navpage navpageleft": "navpage"}>
            {view.icon}
            <Button onClick={() => navigate(view)} className="pagelink">{view.id}</Button>
          </div>
        )
      })}
      <div className={"navend"} />
    </Row>
  )
}
