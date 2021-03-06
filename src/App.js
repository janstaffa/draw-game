import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";
import Register from './Register';
import Game from './Game';

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <Router>
          <Switch>
            <Route exact path="/register">
              <Register />
            </Route>
            <Route exact path="/play">
              <Game />
            </Route>
            <Route path="/">
              <Redirect to="/register" />
            </Route>
          </Switch>
        </Router>

      </div>
    );
  }
}

export default App;
