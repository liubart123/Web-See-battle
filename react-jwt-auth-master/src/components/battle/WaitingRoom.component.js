//parent component for all components, that need socket connection with server

//create socketio connection according to RoomId in url parameter

import RenderBfField from '../battleFormation/FieldRenderer'
import battleFormationService from '../../services/battleFormation/battleFormation'

import React, { Component } from "react";
import MessageOut from "../common/messageOutput.component"
import FindRoomServie from "../../services/battle/findBattle"

import { Switch, Route, Link } from "react-router-dom";
import { withRouter } from 'react-router-dom';
import { io } from "socket.io-client";
import Select from 'react-select'



class WaitingRoom extends Component {
    constructor(props) {
        super(props);
        this.state= {
            room:props.room,
            player:props.player,
            bfsList: undefined, //response of server, name with id
            bfsListDropDownOptions: undefined,  //collection - attripute of Select component
            bfId:undefined,
        }
        this.getBfByIdFromServerAndSet = this.getBfByIdFromServerAndSet.bind(this);
        this.getBfListAndRender = this.getBfListAndRender.bind(this);
        this.getBfListAndRender();
    }
    getBfListAndRender() {
        battleFormationService.getBfList().then(res => {
            let bfsListDropDownOptions=res.map(bf=>({
                "value":bf.id,
                "label":bf.name
            }))
            this.setState({
                bfsList: res,
                bfsListDropDownOptions: bfsListDropDownOptions,
            })
        })
        .catch(e => {
            this.setState({
                error_message: e.message ? e.message : JSON.stringify(e)
            })
        })
    }
    getBfByIdFromServerAndSet(id) {
        battleFormationService.getBf(id).then(res => {
            this.props.onBattleFormationChange(res.data.BattleFormationCells);
        })
        .catch(e => {
            this.setState({
                error_message: e.message ? e.message : JSON.stringify(e)
            })
        })
    }
    handleDropDownChange(e) {
        this.setState({ bfId: e.value})
        this.getBfByIdFromServerAndSet(e.value);
    }
    render() {
        return (
            <div class='awesomePanel'>
                {/* <br />
                count of players: {this.props.room.playersNumber}
                <br />
                max count of players: {this.props.room.maxPlayersNumber}
                <br />
                count of ready players: {this.props.room.readyPlayersNumber}
                <br /> */}
                is ready: 
                {this.props.player.isReady?'true':'false'}
                <br />
                <button style={{width:'300px'}} class='awesomeButton'
                 onClick={this.props.onReadinessChange}>change readiness</button>
                <div 
                    class='awesomeInput'
                    style={{width:'300px'}}>
                    <Select 
                        class='awesomeInput'
                        onChange={this.handleDropDownChange.bind(this)}
                        options={this.state.bfsListDropDownOptions}></Select>
                </div>
                <div>
                    cells:
                    <RenderBfField disabled={this.props.player.isReady} cells={this.props.cells} onCellClick={this.props.onCellClick}></RenderBfField>
                </div>
                <MessageOut message={this.state.message} error_message={this.state.error_message}
                    onCloseMessage={() => { this.setState({ message: "" }) }}
                    onCloseErrorMessage={() => { this.setState({ error_message: "" }) }}
                ></MessageOut>
            </div>
        );
    }
}

export default withRouter(WaitingRoom);