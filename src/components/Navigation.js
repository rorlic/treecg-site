
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
    <nav className="navigation">
      <p>
        <a className="navpageheader" href="/">TREE</a>
      </p>
      <ul>
      {Object.values(availableViews).map((view, index) => {
        return (
          <li className={view.newtab ? "navpage new" : "navpage"}>
            <a href={view.target}>{view.id}</a>
          </li>
        )
      })}
      </ul>
    </nav>
  )
}
