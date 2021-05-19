import React, { Component } from "react";

import { io } from "socket.io-client";

import { Switch, Route, Link } from "react-router-dom";
import route1 from "./route1.component"
import route2 from "./route2.component"


export default class RouteTest extends Component {
  constructor(props) {
    super(props);
  }

  socketTest=()=>{
    let url = process.env.REACT_APP_API_URI;
    url = 'localhost:3000';
    const socket = io(url);
    socket.onmessage = (data) => {
      console.log(data);
    };
    // socket.close();
  }

  render() {
    return (
        <div>
          test route
          <button onClick={()=>this.socketTest()}>socket</button>
          <Switch>
            <Route path={this.props.baseUrl + "/route1"} component={route1} />
            <Route path={this.props.baseUrl + "/route2"}  component={route2} />
          </Switch>
        </div>
    );
  }
}
