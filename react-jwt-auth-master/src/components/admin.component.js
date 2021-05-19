import React, { Component } from "react";
import banService from '../services/ban.serivce'
import MessageOut from "../components/common/messageOutput.component"

export default class AdminComp extends Component {
  constructor(props) {
    super(props);

    this.state = {
        username:""
    };
    this.handleChangeUsername = this.handleChangeUsername.bind(this);
    this.changeRole = this.changeRole.bind(this);
  }

  handleChangeUsername(event){
    this.setState({username: event.target.value})
  }

  changeRole(role){
      
        this.setState({
            loading1: true,
            message: "",
            error_message: "",
        })

        banService.changeRole(this.state.username,role)
                .then((res)=>{
                    this.setState({
                        loading1:false
                    })
                    this.setState({
                        message: 'okk'
                    })
                })  
                .catch(err => {
                    this.setState({
                        loading1: false
                    })
                    
                    if (err) {
                        if (err.error_message) {
                            this.setState({
                                error_message: err.error_message
                            })
                        }else if (err.message) {
                            this.setState({
                                error_message: err.message
                            })
                        } else {
                            this.setState({
                                error_message: 'unknown error'
                            })
                        }
                    } 
                });
  }

  componentDidMount() {
  }

  render() {
    return (
      <div className="awesomePanel">
        <div class="awesomeLabelInputLine">
            <label class='awesomeLabel'>Username: </label>
            <input class='awesomeInput' type='text' value={this.state.username} 
                onChange={this.handleChangeUsername}/>  
        </div>
        <button
            onClick={()=>{this.changeRole(10)}}
            className="btn btn-primary btn-block awesomeButton"
        >
            {this.state.loading1 && (
            <span className="spinner-border spinner-border-sm"></span>
            )}
            <span>Make moder</span>
        </button>
        <button
            onClick={()=>{this.changeRole(15)}}
            className="btn btn-primary btn-block awesomeButton"
        >
            {this.state.loading1 && (
            <span className="spinner-border spinner-border-sm"></span>
            )}
            <span>Make admin</span>
        </button>
        <MessageOut message={this.state.message} error_message={this.state.error_message}
            onCloseMessage={()=>{this.setState({message:""})}}
            onCloseErrorMessage={()=>{this.setState({error_message:""})}}
        ></MessageOut>
      </div>
    );
  }
}
