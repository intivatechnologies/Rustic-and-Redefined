import axios from 'axios';

const MACRO_SERVER = "https://rusticandredefined.ca:8081";

const PORTS = {
    CLIENT: "https://rusticandredefined.ca",
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