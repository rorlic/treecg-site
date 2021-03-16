import React, { useEffect, useState } from 'react'
import { Col, Row, Button } from 'react-bootstrap'
import config from '../Config'
import useProfile from '../hooks/useProfile'

export const TeamComponent = () => {
  const teamIds = config.get('team')  
  return(
    <div className="teamComponent">
      <h1><b>Team</b></h1>
      <Row>
        {teamIds.map(id => 
          <Col lg={6} md={12} sm={12}>
            <PersonCard webId={id}/>
          </Col>
        )}
      </Row>
    </div>
  )
}

const PersonCard = (props) => {
  const profile = useProfile(props.webId)
  console.log('PROFILE', profile)
  return (
    <div className="personCard">
    { profile 
      ? <Row>
          <Col sm={4} md={4} lg={3}>
            <img className="teamPicture" src={profile.img}/>
          </Col>

          <Col sm={8} md={8} lg={9}>
              {["name", "title"].map(key => {
                return (
                  <Row>
                    <Col lg={3} md={3} sm={12}><b>{key}</b></Col>
                    <Col lg={9} md={9} sm={12}>{profile[key]}</Col>
                  </Row>
                )
              })}
              { profile.mbox && 
                <Row>
                  <Col lg={3} md={3} sm={12}><Button onClick={() => window.location.href = profile.mbox}>Contact</Button></Col>
                </Row>
              }
          </Col>
        </Row>
      : <div />
    }
    </div>
        
  )
}