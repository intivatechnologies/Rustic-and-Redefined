import axios from 'axios';

const MACRO_SERVER = "http://localhost:8081";

const PORTS = {
    CLIENT: "http://localhost:8080",
    SERVER: MACRO_SERVER,

    serverMessenger: axios.create({
        baseURL: MACRO_SERVER,
        headers: { 'Content-Type': 'application/json' }
    }),

    postOptions: jsonBody => {
        return {
            method: "POST",
            body: JSON.stringify(jsonBody),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
};

export default PORTS;