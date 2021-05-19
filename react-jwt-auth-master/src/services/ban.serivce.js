//ban ad report


import axios from "axios";
import authHeader from './auth-header';

const API_URL = process.env.REACT_APP_API_URI + "api";

class UserService {
    report(id){
        return axios.get(API_URL+"/report", { 
            headers: authHeader(),
            params: {
                id: id
            } 
        });
    }
    ban(id){
        return axios.get(API_URL + "/ban", { 
            headers: authHeader(),
            params: {
                id: id
            } 
        });
    }
    changeRole(username,role){
        return axios.get(API_URL + "/changeRole", { 
            headers: authHeader(),
            params: {
                username:username,
                role:role
            } 
        });
    }
}

export default new UserService();

