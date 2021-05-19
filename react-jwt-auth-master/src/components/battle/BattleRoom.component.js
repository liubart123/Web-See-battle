//renders room in battle state
//draws all players shotmaps and player's battle formation



import RenderBfField from '../battleFormation/FieldRenderer'
import battleFormationService from '../../services/battleFormation/battleFormation'

import React, { Component } from "react";
import MessageOut from "../common/messageOutput.component"
import FindRoomServie from "../../services/battle/findBattle"

import { Switch, Route, Link } from "react-router-dom";
import { withRouter } from 'react-router-dom';
import { io } from "socket.io-client";
import Select from 'react-select'


//props room, player
class BattleRoom extends Component {
    constructor(props) {
        super(props);
        this.state={
            roundTime:props.room.roundTime,
            //roundTimer,
        };
        // this.state={
        //     player:this.props.player,
        //     room:this.props.room,

        // }
        this.RenderPlayersInBattle=this.RenderPlayersInBattle.bind(this);
        this.createTakeShotHandler=this.createTakeShotHandler.bind(this);
        this.createRoundTimer=this.createRoundTimer.bind(this);

    }
    static getDerivedStateFromProps(props, state) {
        // console.log(`getDerivedStateFromProps battle room. roundTime:${props.room.roundTime}`)
        // console.log(`getDerivedStateFromProps battle room. this roundTime:${this.props.room.roundTime}`)
        if (props.room.roundTime){
            return {roundTime:props.room.roundTime}
        }else 
            return {} 
    }
    componentDidUpdate(prevState){
        //console.log(`componentDidUpdate battle room. roundTime:${this.state.roundTime}`)
        //if (this.props.room.roundTime)
        // this.setState({
        //     roundTime:this.props.room.roundTime
        // })
        //console.log(`componentDidUpdate battle room. propsroundTime:${this.props.room.roundTime}`)
    }
    componentDidMount(){
        // console.log(`componentDidMount`)
        this.createRoundTimer();
    }

    createRoundTimer(){
        if (this.state.roundTimer)
            clearTimeout(this.state.roundTimer);
        let timer = setInterval(()=>{
            let newValue = this.state.roundTime-1;
            this.props.room.roundTime=0;
            // console.log(`battle room. setState roundTime:${newValue}`)
            this.setState({
                roundTime:newValue
            })
        },1000);
        this.setState({
            roundTimer:timer,
        })
    }

    createTakeShotHandler(order){
        return (x,y)=>{
            this.props.room.socket.emit('takeShot',x,y,0,order);
        }
    }

    RenderPlayersInBattle(){
        let html = [];
        for(let i=0;i<this.props.room.players.length;i++){
            if (i==this.props.player.order)
                continue;
            html.push(
                <div class='awesomePanel'>
                    Player #{i}
                    {/* {JSON.stringify(this.props.room.players[i])}
                    {JSON.stringify(this.props.room.players[i].shotMap)} */}
                    {/* isPlaying:{this.props.room.players[i].isPlaying} */}
                    {/* <br/> */}
                    <RenderBfField 
                        shots={this.props.room.players[i].shotMap} 
                        onCellClick={this.createTakeShotHandler(i)}
                        disabled = {!this.props.room.players[i].isPlaying || !this.props.player.isPlaying}
                    ></RenderBfField>
                </div>
            )
        }
        return <div >
            {html}
        </div>
    }


    render() {
        // console.log(`render battle room. roundTime:${this.state.roundTime}`)
        return (
            <div>
                battle room
                <br />
                <div>
                    round timer: {this.state.roundTime} / {this.props.room.maxRoundTime}
                </div>
                <div>
                    round:{this.props.room.roundNumber}
                </div>
                <div>
                    count of shots for this round:{this.props.player.countOfShotsInRound}/{this.props.room.maxCountOfShotsInRound}
                </div>
                <br />
                <br/>
                {
                    !this.props.player.isPlaying?(
                        <div> game over. Place: {this.props.player.gamePlace}</div>
                    ):(<div></div>)
                }
                <div class='awesomeParentForPlayersFields'>
                    <div class='awesomePanel'>
                        owner's field:
                        <RenderBfField 
                            disabled={true} 
                            cells={this.props.player.battleFormation}
                            shots={this.props.room.players[this.props.player.order].shotMap} 
                            // disabled = {!this.props.player.isPlaying}
                        ></RenderBfField>
                    </div>
                    <this.RenderPlayersInBattle></this.RenderPlayersInBattle>
                </div>
                <MessageOut message={this.state.message} error_message={this.state.error_message}
                    onCloseMessage={() => { this.setState({ message: "" }) }}
                    onCloseErrorMessage={() => { this.setState({ error_message: "" }) }}
                ></MessageOut>
            </div>
        );
    }
}

export default withRouter(BattleRoom);