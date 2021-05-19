//find battle :3
//send requests to server

import authHeader from '../auth-header'

import axios from "axios";

const API_URL = process.env.REACT_APP_API_URI + "api/room";


class RoomManager{
    findBattle(body){
        
        // return axios.get(process.env.REACT_APP_API_URI + "api/battleFormation", {
        //     withCredentials: true,
        //     headers: authHeader(),
        // })
        // .then(res=>{
        //     return res.data;
        // })
        return axios.post(API_URL+'/find',body, {
            withCredentials: true,
            headers: authHeader(),
        }).then(res=>{
            return res.data;
        })
    }
    findBattleById(id){
        return axios.get(API_URL+'/find/'+id,{
            withCredentials: true,
            headers: authHeader(),
        }).then(res=>{
            return res.data;
        })
    }
    createRoom(body){
        return axios.post(API_URL+'/add',body, {
            withCredentials: true,
            headers: authHeader(),
        }).then(res=>{
            return res.data;
        })
    }
}


export default new RoomManager();

  