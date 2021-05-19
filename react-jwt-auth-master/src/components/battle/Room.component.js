//parent component for all components, that need socket connection with server

//create socketio connection according to RoomId in url parameter

import React, { Component } from "react";
import MessageOut from "../common/messageOutput.component"
import FindRoomServie from "../../services/battle/findBattle"

import { Switch, Route, Link } from "react-router-dom";
import { withRouter } from 'react-router-dom';
import { io } from "socket.io-client";
import WaitingRoom from './WaitingRoom.component';
import BattleRoom from './BattleRoom.component';
import AuthService from '../../services/auth.service';
import BanService from '../../services/ban.serivce';


const isDebugging = process.env.NODE_ENV ;
const API_URL = process.env.REACT_APP_API_URI + "api/auth/";


function DisplayRoomPlayers(props){
    
    let reportUser=(id)=>{
        BanService.report(id);
    }
    let banUser=(id)=>{
        BanService.ban(id);
    }
    let html=[];
    let role = props.role;
    let owner = props.ownOrder;
    let i=0;
    for(let pl of props.players){
        html.push(
            <div
                class={pl.isPlayer?'':'awesomePlayerInfoOffline'}
                >
                № - {pl.order} {pl.userName}{!pl.isReady?'':' (Ready)'}. Matches played: {pl.matches} Winrate: {pl.winrate} Reports:{pl.reports}
                {i!=owner && pl.isPlayer && pl.userId!=-1?(<div>
                    {role>=10?(
                        <button class='awesomeButton' onClick={(e)=>reportUser(pl.userId)} style={{width:'75px'}}>report</button>
                    ):(
                        <div></div>
                    )}
                    {role>=15?(
                        <button class='awesomeButton' onClick={(e)=>banUser(pl.userId)}  style={{width:'50px'}}>ban</button>
                    ):(
                        <div></div>
                    )}
                </div>):(<div>

                </div>)}
            </div>
        )
        i++;
    }
    return <div>
        {html}
    </div>
} 

class Room extends Component {
    constructor(props) {
        super(props);
        const params = new URLSearchParams(this.props.location.search);
        
        let userId = JSON.parse(localStorage.getItem('user'))? JSON.parse(localStorage.getItem('user')).id:-1;
        this.state = {
            room: {
                roomId: params.get('roomId'),
                socket: undefined,
                isWaiting: true,
                // readyPlayersNumber: 0,
                battleType :0,
                players:[],
            },
            player: {
                userId: userId,
                isReady:false,
                order:0,
                battleFormation:[],
            },
        }
        this.createSocketConnection = this.createSocketConnection.bind(this);
        this.addHandlersToSocket = this.addHandlersToSocket.bind(this);
        this.onPlayerReadinessChange = this.onPlayerReadinessChange.bind(this);
        this.battleFormationClickHandler = this.battleFormationClickHandler.bind(this);
        this.battleFormationChangeHandler = this.battleFormationChangeHandler.bind(this);
        this.handlerForDebug = this.handlerForDebug.bind(this);
        this.createSocketConnection(this.state.room.roomId, this.state.player.userId);
    }
    componentDidMount(){
        let user = AuthService.getCurrentUser();
        if (!user){
            user = {role:0,id:-1}
        }
        this.setState({
            currentUser: user,
        });
    }
    componentWillUpdate(nextProps, nextState){
        let asd = nextState;

    }
    componentDidUpdate(prevProps, prevState){
        let asd = this.state.room;
    }
    componentWillUnmount(){
        if (this.state.room.socket)
            this.state.room.socket.disconnect();
    }
    battleFormationClickHandler(x,y){
        if (this.state.player.battleFormation[y][x]==0)
            this.state.player.battleFormation[y][x]=1;
        else 
            this.state.player.battleFormation[y][x]=0;
        this.setState({ player: this.state.player});
    }
    battleFormationChangeHandler(cells){
        let copy = {...this.state.player};
        copy.battleFormation = cells;
        this.setState({player:copy})
    }

    handlerForDebug(){
        let rom = this.state.room;
    }

    render() {
        const socket = this.state.room.socket;
        const isWaiting = this.state.room.isWaiting;
        const room = this.state.room;
        // console.log(`render room. roundTime:${this.state.room.roundTime}`)
        return (
            <div>
                <div class='awesomePanel'>
                    room: {this.state.room.roomId}
                    <br/>
                    battle type: {this.state.room.battleType}
                    <DisplayRoomPlayers ownOrder={this.state.player.order} players={this.state.room.players} role={this.state.currentUser?this.state.currentUser.role:0}></DisplayRoomPlayers>
                </div>
                {socket?(
                    isWaiting?(
                        <WaitingRoom room={this.state.room} player={this.state.player}
                            cells={this.state.player.battleFormation}
                            onCellClick={this.battleFormationClickHandler}
                            onBattleFormationChange={this.battleFormationChangeHandler}
                            onReadinessChange={this.onPlayerReadinessChange}></WaitingRoom>
                        ):(
                            this.state.room.isBattleInAction?(
                                <BattleRoom room={room} player={this.state.player}
                                    onCellClick={this.battleFormationClickHandler}></BattleRoom>
                            ):(
                                <div>
                                    iunknown room state
                                </div>
                            )
                        )
                ):(
                    <div>
                        socket is closed....
                    </div>
                )}
                <MessageOut message={this.state.message} error_message={this.state.error_message}
                    onCloseMessage={() => { this.setState({ message: "" }) }}
                    onCloseErrorMessage={() => { this.setState({ error_message: "" }) }}
                ></MessageOut>
            </div>
        );
    }

    onPlayerReadinessChange = ()=>{
        this.state.player.isReady = !this.state.player.isReady;
        this.state.room.socket.emit('playerChanged', this.state.player);
        this.setState({player : this.state.player});
    }

    addHandlersToSocket = (socket) =>{
        socket.on('getCommonRoomState',rm=>{
            let stateRoom = { ...this.state.room };
            stateRoom.maxPlayersNumber = rm.maxPlayersNumber;
            stateRoom.isWaiting = rm.isWaiting;
            stateRoom.battleType = rm.battleType;
            stateRoom.isBattleInAction=rm.isBattleInAction;

            stateRoom.roundTime=rm.roundTime;
            stateRoom.maxRoundTime=rm.maxRoundTime;
            stateRoom.roundNumber=rm.roundNumber;
            stateRoom.maxCountOfShotsInRound=rm.maxCountOfShotsInRound;


            stateRoom.players = rm.players;
            // stateRoom.players2 = [...rm.players];
            // stateRoom.players2[1].shotMap = rm.players[1].shotMap;
            // stateRoom.shotMap = rm.players[1].shotMap;

            this.setState({ room:stateRoom })
        })
        socket.on('getPlayerInRoomState', fullPlayerState => {
            // let statePlaer = { ...this.state.player };
            // statePlaer.order = fullPlayerState.order;
            // statePlaer.battleFormation = fullPlayerState.battleFormation;
            // statePlaer.isReady = fullPlayerState.isReady;
            // statePlaer.order = fullPlayerState.order;

            this.setState({ player: fullPlayerState },(asd)=>{
                let dsa = asd;
            })
        })
        socket.on('playerChanged', (newPlayerState, order) => {
            // let changedPlayer = this.state.room.players[order]

            // changedPlayer.isPlayer = newPlayerState.isPlayer;
            // changedPlayer.isReady = newPlayerState.isReady;
            // changedPlayer.userId = newPlayerState.userId;
            this.state.room.players[order]=newPlayerState;
            this.setState({ room: this.state.room })
        })
    }

    //create socket connection and add base handlers (connection, send...)
    createSocketConnection = (roomId, userId) => {
        var socket = io(process.env.REACT_APP_API_URI,
            {
                query: {
                    roomId: roomId,
                    userId: userId,
                }
            });
        socket.on('connect', (arg) => {
            let stateRoom = { ...this.state.room };
            stateRoom.socket = socket;
            this.setState({ room:stateRoom })
            this.setState({
                message: arg
            })
        })
        socket.on('message', msg => {
            if (msg.message || msg.error_message){
                this.setState({
                    message: msg.message,
                    error_message:msg.error_message,
                })
            } else {
                this.setState({
                    message: msg,
                })
            }
        })
        socket.on('error', msg => {
            this.setState({
                error_message: msg
            })
        })
        socket.on('disconnect', msg => {
            // this.setState({
            //     message: msg
            // })
        })
        this.addHandlersToSocket(socket);
    }
}

export default withRouter(Room);