import React, { Component } from "react";


import axios from "axios";

const API_URL = process.env.REACT_APP_API_URI + "api/";


export default class Records extends Component {
  constructor(props) {
    super(props);

    this.state = {
        records:[]
    };
  }

  componentDidMount() {
    axios.get(API_URL + "records")
        .then(response=>{
            this.setState({
                records:response.data
            })
        })
  }

  render() {
        let tableContent=[];
        for(let user of this.state.records){
            tableContent.push(<tr>
                <td>{user.userName}</td>
                <td>{user.matches}</td>
                <td>{user.winrate}</td>
                <td>{user.reports}</td>
            </tr>)
        }
        return (
        <div class='awesomePanel'>
            <h5>Record Table</h5>
            <br/>
            <table class='recordsTableColumn' border='1px solid gray'>
                <th>Name</th>
                <th>Matches</th>
                <th>Winrate</th>
                <th>Reports</th>
                {tableContent}
            </table>
        </div>
        );
  }
}
