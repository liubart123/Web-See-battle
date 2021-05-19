//contains necessary forms to find room.
//helps to start socket connection with server :3

//after selecting option redirect to Room with roomId and other necessary fro room parameters in the url
//where socktio connection is created and game is started!!!!!!!! 

import React, { Component } from "react";
import MessageOut from "../common/messageOutput.component"
import FindRoomServie from "../../services/battle/findBattle"
import { withRouter } from 'react-router-dom';

import battleFormationService from '../../services/battleFormation/battleFormation'


class FindRoom extends Component {
    constructor(props) {
        super(props);
        this.findRoom = this.findRoom.bind(this);
        this.findRoomRender = this.findRoomRender.bind(this);
        this.createRoom = this.createRoom.bind(this);
        this.createRoomRender = this.createRoomRender.bind(this);
        this.findRoomByIdRender = this.findRoomByIdRender.bind(this);
        this.handleMinPlayers = this.handleMinPlayers.bind(this);
        this.handleMaxPlayers = this.handleMaxPlayers.bind(this);
        this.handleBattleIdChange = this.handleBattleIdChange.bind(this);
        this.battleTypesRender = this.battleTypesRender.bind(this);
        this.handleCreateMaxPlayers = this.handleCreateMaxPlayers.bind(this);
        this.handleChangeBattleType = this.handleChangeBattleType.bind(this);
        this.state = {
            loading1:false,
            message:"",
            error_message:"",

            //find random room
            findRoomMinPlayers:2,
            findRoomMaxPlayers:2,
            findRoomBattleTypes:[],

            //create room
            createRoomPlayers:2,
            createRoomBattleType:0,

            //find room bby id
            findRoomId:undefined,

            //battleType    //(hardcoded collection of accessible battle types) {id:name}
            battleTypes:[
                {id:0,name:'Classic'},
                {id:1,name:'Classic2'},
                {id:1,name:'Classic2'},
                {id:1,name:'Classic2'},
                {id:1,name:'Classic2'},
                {id:1,name:'Classic2'},
                {id:1,name:'Classic2'},
            ]
        }
    }

    handleMinPlayers(event){
        let val = parseInt(event.target.value);
        if (val<2)
            val=2;
        else if (val>this.state.findRoomMaxPlayers)
            val= this.state.findRoomMaxPlayers;
        this.setState({findRoomMinPlayers: val})
    }
    handleMaxPlayers(event){
        let val = parseInt(event.target.value);
        if (val<this.state.findRoomMinPlayers)
            val=this.state.findRoomMinPlayers;
        this.setState({findRoomMaxPlayers: val})
    }
    handleCreateMaxPlayers(event){
        let val = parseInt(event.target.value);
        this.setState({createRoomPlayers: val})
    }

    handleBattleIdChange(event){
        let val = parseInt(event.target.value);
        if (val!=undefined)
            this.setState({findRoomId: val})
    }
    handleChangeBattleType(index, isFindRoom){
        if (isFindRoom){
            this.state.findRoomBattleTypes[index]=!this.state.findRoomBattleTypes[index];
            this.setState({
                findRoomBattleTypes:this.state.findRoomBattleTypes
            })
        }else {
            this.setState({
                createRoomBattleType:index
            })
        }
    }

    battleTypesRender(props){
        let inputs=[];
        let inputType = props.isFindRoom?'checkbox':'radio';
        for(let i=0;i<this.state.battleTypes.length;i++){
            inputs.push(<div>
                <input
                    type={inputType}
                    onChange={()=>{this.handleChangeBattleType(i,props.isFindRoom)}}
                    checked={props.isFindRoom?
                        this.state.findRoomBattleTypes[i]:
                        this.state.battleTypes[i].id==this.state.createRoomBattleType}
                    >
                    </input>
                    {this.state.battleTypes[i].name}
            </div>)
        }
        return <form  class='awesomeBattleTypes' >
                {inputs}
            </form>
    }

    findRoomRender(){
        return <div className="awesomeFormFindRoom ">
            {/* min players input */}
            <div class="awesomeLabelInputLine">
                <label class='awesomeLabel'>Minimal players count: </label>
                <input class='awesomeInput' type='number' value={this.state.findRoomMinPlayers} 
                    onChange={this.handleMinPlayers}/>    
            </div>
            
            {/* max players input */}
            <div class="awesomeLabelInputLine">
                <label class='awesomeLabel'>Maximal players count: </label>
                <input class='awesomeInput' type='number' value={this.state.findRoomMaxPlayers} 
                    onChange={this.handleMaxPlayers}/>  
            </div>
            
            {/* battle type input */}
            <div class="awesomeLabelInputLine">
                <label  class='awesomeLabel'>Battle types: </label>
                <this.battleTypesRender isFindRoom={true}></this.battleTypesRender>
                <span style={{color:'rgba(0, 0, 0, 0.5)'}}>
                    Leave them empty to start finding for all types of battle
                </span>
            </div>
            <button
                onClick={()=>{this.findRoom()}}
                className="btn btn-primary btn-block awesomeButton"
            >
                {this.state.loading1 && (
                <span className="spinner-border spinner-border-sm"></span>
                )}
                <span>Find room</span>
            </button>
        </div>
    }
    createRoomRender(){
        return             <div className="awesomeFormFindRoom">
                <div class='awesomeLabelInputLine' >
                    <label class='awesomeLabel' >Maximal players count: </label>
                    <input class='awesomeInput' type='number' value={this.state.createRoomPlayers} 
                            onChange={this.handleCreateMaxPlayers}/>
                </div>
                <div class='awesomeLabelInputLine' >
                    <label class='awesomeLabel'>Battle types: </label>
                    <this.battleTypesRender isFindRoom={false}></this.battleTypesRender>
                </div>
                <button
                    onClick={this.createRoom}
                    className="btn btn-primary btn-block awesomeButton"
                >
                    {this.state.loading2 && (
                    <span className="spinner-border spinner-border-sm"></span>
                    )}
                    <span>Create room</span>
                </button>
            </div>
            // <div className="form-group container awesomeFormFindRoom">
            //     <div class='row' style={{alignItems:'center', justifyContent:'center', margin: 0}}>
            //         <label class='col-6 text-center' >Maximal players count: </label>
            //         <input class='form-control  col-6' type='number' value={this.state.createRoomPlayers} 
            //                 onChange={this.handleCreateMaxPlayers}/>
            //     </div>
            //     <label>Battle types: </label>
            //     <this.battleTypesRender isFindRoom={false}></this.battleTypesRender>
            //     <button
            //         onClick={this.createRoom}
            //         className="btn btn-primary btn-block "
            //     >
            //     {this.state.loading2 && (
            //       <span className="spinner-border spinner-border-sm"></span>
            //     )}
            //     <span>Create room</span>
            //   </button>
            // </div>
    }
    findRoomByIdRender(){
        return <div class="awesomeFormFindRoom  ">
                <div class="awesomeLabelInputLine" >
                    <label class= 'awesomeLabel'>Room's id: </label>
                    <input type='text' value={this.state.findRoomId} 
                        class=' awesomeInput'
                        onChange={this.handleBattleIdChange}/>
                </div>
                <button
                    onClick={()=>{this.findRoomById()}}
                    className="btn btn-primary btn-block awesomeButton"
                >
                    {this.state.loading3 && (
                    <span className="spinner-border spinner-border-sm"></span>
                    )}
                    <span>Find room By Id</span>
                </button>
                
            </div>
    }


    findRoom(){
        let battleTypesAsIntArray = [];
        for(let i=0;i<this.state.battleTypes.length;i++){
            if (this.state.findRoomBattleTypes[i]){
                battleTypesAsIntArray.push(i);
            }
        }
        if (battleTypesAsIntArray.length==0){
            for(let i=0;i<this.state.battleTypes.length;i++){
                battleTypesAsIntArray.push(i);
            }
        }
        let body = {
            maxPlayers:this.state.findRoomMaxPlayers,
            minPlayers:this.state.findRoomMinPlayers,
            battleTypes:battleTypesAsIntArray,
        }
        this.setState({
            loading1: true,
            message: "",
            error_message: "",
        })


        FindRoomServie.findBattle(body)
            .then((res)=>{
                this.setState({
                    loading1:false
                })
                // var history = useHistory();
                this.props.history.push({
                    pathname: `/battleroom`,
                    search: `?roomId=${res}`,
                    // roomId: res,
                });
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
    createRoom(){
        let body = {
            maxPlayersNumber:this.state.createRoomPlayers,
            battleType:this.state.createRoomBattleType,
        }
        this.setState({
            loading2: true,
            message: "",
            error_message: "",
        })
        FindRoomServie.createRoom(body)
            .then((res)=>{
                this.setState({
                    loading2:false
                })
                // var history = useHistory();
                this.props.history.push({
                    pathname: `/battleroom`,
                    search: `?roomId=${res}`,   
                    // roomId: res,
                });
            })  
            .catch(err => {
                this.setState({
                    loading2: false
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
    findRoomById(){

        if (this.state.findRoomId!=undefined){
            this.props.history.push({
                pathname: `/battleroom`,
                search: `?roomId=${this.state.findRoomId}`,
                // roomId: res,
            });
        }else {
            
            this.setState({
                error_message: 'incorrect id'
            })
        }
    }

  render() {
    return (
        <div class = "" 
            // style={{backgroundColor: 'red'}}
        >
            <div class=" awesomeParentForFindRoomForms">
                <div class="awesomeFindRoomForm" >
                    <this.findRoomRender></this.findRoomRender>
                </div>
                <div class="awesomeFindRoomForm" >
                    <this.createRoomRender></this.createRoomRender>
                </div>
                <div class="awesomeFindRoomForm">
                    <this.findRoomByIdRender></this.findRoomByIdRender>
                </div>
            </div>
            <MessageOut message={this.state.message} error_message={this.state.error_message}
                onCloseMessage={()=>{this.setState({message:""})}}
                onCloseErrorMessage={()=>{this.setState({error_message:""})}}
            ></MessageOut>
            
        </div>
    );
  }
}

export default withRouter(FindRoom);