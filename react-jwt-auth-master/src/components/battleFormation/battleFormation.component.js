
import RenderBfField from './FieldRenderer';
import authHeader from '../../services/auth-header'
import battleFormationService from '../../services/battleFormation/battleFormation'

import React, { Component } from "react";
import axios from "axios";

import MessageOut from "../common/messageOutput.component"
import { Link, withRouter } from 'react-router-dom';

import trashIcon from '../../images/trash.png';

const API_URL = process.env.REACT_APP_API_URI + "api/battleFormation";



class BattleFormationComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bfsList: [],
            //prevUrl: this.props.location.pathname,
        }
        this.getBfList = this.getBfListAndRender.bind(this);
        this.RenderBfList = this.RenderBfList.bind(this);
        this.RenderBfRedactor = this.RenderBfRedactor.bind(this);
        this.deleteBf = this.deleteBf.bind(this);
        this.setBfByIdToState = this.getBfByIdFromServerAndSet.bind(this);
        this.checkUrlForParameters = this.checkUrlForParameters.bind(this);
        this.onCellClick = this.onCellClick.bind(this);
        this.updateBfField = this.updateBfFieldFromServer.bind(this);
        this.handleBfNameInput = this.handleBfNameInput.bind(this);
        this.setBfByServerResponse = this.setBfByServerResponse.bind(this);
        this.insertNewBf = this.insertNewBf.bind(this);
        this.checkUrlForParameters();
    }
    //change state according toi url paramteters
    checkUrlForParameters(){
        // if (this.props.location.pathname===this.state.prevUrl)
        //     return
        const params = new URLSearchParams(this.props.location.search);
        let bfId = params.get('id');
        if (bfId) {
            this.getBfByIdFromServerAndSet(bfId);
        }
        else {
            this.getBfListAndRender();
        }
    }

    deleteBf(idToDelete){
        battleFormationService.deleteBf(idToDelete)
        .then(res => {
            if (!this.state.bfsList)
                return; 
            let copy = [...this.state.bfsList];
            for(let i=0;i<copy.length;i++){
                if (copy[i] && copy[i].id == idToDelete) {
                    copy.splice(i, 1);
                    break;
                }
            }
            this.setState({
                bfsList: copy
            })
        })
        .catch(e => {
            this.setState({
                error_message: e.message ? e.message : JSON.stringify(e)
            })
        })
    }

//#region battle formation list recieving and rendering. New button also :3

    getBfListAndRender() {
        battleFormationService.getBfList().then(res => {
            this.setState({
                bfsList: res,
                bf:undefined
            })
        })
        .catch(e => {
            this.setState({
                error_message: e.message ? e.message : JSON.stringify(e)
            })
        })
    }
    RenderBfList(props){
        let htmlList = [];
        for (let bf of this.state.bfsList){
            htmlList.push(<tr class="battleFormationRow">
                <td>
                    <Link  to={{ search: `id=${bf.id}` }} onClick={() => {
                        this.getBfByIdFromServerAndSet(bf.id)
                    }}
                        style={{color:'black'}}
                    > {bf.name}</Link>
                </td>
                <td>
                    {/* <img src={trashIcon}/> */}
                    {/* <a href="" title="bqlqn">bqlqn</a>     */}
                    {/* <button class = "awesomeButton" >Delete</button>     */}
                    <input type="image" src={trashIcon} onClick={()=>{
                        this.deleteBf(bf.id);
                    }}
                        style={{width:'20px'}}
                        />
                </td>
            </tr>)
        }
        return <div class="awesomeFormFindRoom battleFormationList">
            <div class="awesomeLabelInputLine"
                //  style={{flexWrap:'nowrap'}}
            >
                <h2 class="awesomeLabel">
                RenderBfList</h2>
            
            </div>
             
            <table>
                {/* <tr>
                    <th>Name</th>
                </tr> */}
                {htmlList}
            </table>
            <button class = "awesomeButton" onClick={()=>{
                this.insertNewBf();
            }}>New</button>   
        </div>
    }

    insertNewBf(){
        battleFormationService.insertBf().then(res => {
            this.getBfByIdFromServerAndSet(res.id)
        })
        .catch(e => {
            this.setState({
                error_message: e.message ? e.message : JSON.stringify(e)
            })
        })
    }

//#endregion

//#region update and render bf
    setBfByServerResponse(response){

        this.setState({
            bf: response.data,
            bfsList: undefined
        })
    }

    //get bf from server and set it to the state...:3
    getBfByIdFromServerAndSet(id){
        battleFormationService.getBf(id).then(res => {
            this.setBfByServerResponse(res);
        })
        .catch(e => {
            this.setState({
                error_message: e.message ? e.message : JSON.stringify(e)
            })
        })
    }

    onCellClick(x,y){
        let bfCopy = { ...this.state.bf};
        if (bfCopy.BattleFormationCells[y][x]==0)
            bfCopy.BattleFormationCells[y][x]=1;
        else
            bfCopy.BattleFormationCells[y][x]=0;
        this.setState({bf:bfCopy})
    }

    updateBfFieldFromServer(){
        let body = { ...this.state.bf};
        body.id=undefined;
        body.user_id=undefined;

        battleFormationService.updateBf(this.state.bf.id, body).then(res => {
            this.getBfByIdFromServerAndSet(this.state.bf.id);
            // this.setBfByServerResponse(res);
            this.setState({
                message: "updated"
            })
        })
        .catch(e => {
            this.setState({
                error_message: e.message ? e.message : JSON.stringify(e)
            })
        })
    }

    handleBfNameInput(event){
        let copy = {...this.state.bf};
        copy.name=event.target.value;
        this.setState({bf:copy})
    }

    RenderBfRedactor(props) {
        let bf = this.state.bf;
        if (bf)
        return <div>

            <input
                class='awesomeInput'    
                name="bfName"
                type="text"
                value={this.state.bf.name}
                onChange={this.handleBfNameInput} />
            <br />
            <button class='awesomeButton' onClick={() => 
                { this.updateBfFieldFromServer();}} style={{width:'100px'}}>Update</button>
            <button class='awesomeButton' onClick={() => 
                { this.deleteBf(bf.id); this.getBfListAndRender(); }} style={{width:'100px'}}>Delete</button>
            <br />
            name:{bf.name}
            <br />
            id:{bf.id}
            <br />
            type:{bf.formation_type}
            <br />
            cells:
            <RenderBfField cells={bf.BattleFormationCells} onCellClick={this.onCellClick}></RenderBfField>
            {/* cells:{JSON.stringify(bf.BattleFormationCells)} */}
        </div>
    }

//#endregion

    render() {
        //checkUrlForParameters();
        let bf = this.state.bf;
        return (
            <div>
                {bf ? (<this.RenderBfRedactor bf={bf}/>) :
                        (<this.RenderBfList />)
                }
                <MessageOut message={this.state.message} error_message={this.state.error_message}
                    onCloseMessage={() => { this.setState({ message: "" }) }}
                    onCloseErrorMessage={() => { this.setState({ error_message: "" }) }}
                ></MessageOut>
            </div>
        );
    }
}


export default withRouter(BattleFormationComponent)