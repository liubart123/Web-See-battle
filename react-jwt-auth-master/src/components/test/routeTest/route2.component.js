import React, { Component } from "react";

import {letV,varV,constV,func} from "./test"
export default class Route2 extends Component {
  constructor(props) {
    super(props);
    this.state={
      stateV:2
    }
  }


  render() {
    func();
    return (
        <div>
          {letV},{varV},{constV}
          <button onClick={()=>{
            this.setState({stateV:this.state.stateV+1})
            func(5);

          }}>change variables</button>
        </div>
    );
  }
}
