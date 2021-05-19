/*
deleteBf
getBfList
insertNewBf
getBf
updateBf
*/

import authHeader from '../auth-header'

import axios from "axios";

const API_URL = process.env.REACT_APP_API_URI + "api/battleFormation";

class BFService {
    deleteBf(idToDelete){
        return axios.get(API_URL + '/delete', {
            withCredentials: true,
            params: {
                id: idToDelete
            },
            headers: authHeader(),
        })
    }

    getBfList() {
        return axios.get(API_URL, {
            withCredentials: true,
            headers: authHeader(),
        })
        .then(res=>{
            return res.data;
        })
    }
    insertBf(){
        return axios.get(API_URL + '/insert', {
            withCredentials: true,
            headers: authHeader(),
        }).then(res=>
        { 
            return res.data;
        })
    }
    updateBf(id, body){
        return axios.post(API_URL, body, {
            withCredentials: true,
            params: {
                id: id
            },
            headers: authHeader(),
        })
    }
    getBf(id){
        return axios.get(API_URL, {
            withCredentials: true,
            params: {
                id: id
            },
            headers: authHeader(),
        })
    }
}

export default new BFService();
