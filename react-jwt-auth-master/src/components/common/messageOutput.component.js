//display messages from server


import React, { Component } from "react";
export default class MessageOutput extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
        <div class="divForMessages">
            {this.props.message && (
            <div className="form-group">
                <div className="alert alert-warning " role="alert">
                {this.props.message}
                <button class="awesomeMessageButton" onClick={()=>{this.props.onCloseMessage()}}>close</button>
                </div>
            </div>
            )}
            {this.props.error_message && (
            <div className="form-group">
                <div className="alert alert-danger " role="alert">
                {this.props.error_message}
                <button class="awesomeMessageButton" onClick={()=>{this.props.onCloseErrorMessage()}}>close</button>
                </div>
            </div>
            )}
        </div>
    );
  }
}
