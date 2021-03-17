import './App.css';
import { Row, Col } from 'react-bootstrap'
import config from './Config';
// import { TeamComponent } from './PublicationsComponent/TeamComponent';
import configData from "./config.json"
import 'bootstrap/dist/css/bootstrap.min.css';

import { Route, Link, BrowserRouter as Router, Switch, Redirect } from 'react-router-dom'
import { PublicationsComponent } from './components/PublicationsComponent';
import { TeamComponent } from './components/TeamComponent';
import { MainComponent } from './components/MainComponent';
import { Navigation } from './components/Navigation';
import { availableViews } from './util/Util';

// import { IconButton } from "@material-ui/core"


// import githublogo from './img/github.svg'
// import { Navigation } from './components/Navigation';

function App() {
  config.set(configData)

  return (
    <div className="App">
      <Router>
        <Row>
          <Col lg={2} md={1} sm={0}></Col>
          
          <Col lg={8} md={10} sm={12}>
            <Switch>
              <Navigation />

              {Object.values(availableViews).slice(1).map((view) => {
                console.log('TARGET', view.target)
                return (
                  <Route path={view.target}>
                    {view.component}
                  </Route>
                )
              })}}
              
              {/* Default Route must come last */}
              <Route path={availableViews.home.target}>
                {availableViews.home.component}
              </Route>

            </Switch>
          </Col>
          
          <Col lg={2} md={1} sm={0}></Col>
        </Row>
      </Router>
    </div>
  );
}

export default App;

