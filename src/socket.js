import { reactive } from "vue";
import { io } from "socket.io-client";

export const state = reactive({
    connected: false,
    fooEvents: [],
    barEvents: []
});

// "undefined" means the URL will be computed from the `window.location` object
const URL = import.meta.env.VITE_APP_SOCKET_URL || 'http://localhost:3000';

export const socket = io(URL);

// socket.on("connect", (data) => {
//     // state.connected = true;
//     console.log("Connected to the server", data);
// });

socket.on("disconnect", () => {
    console.log("Disconnected from the server");
});

socket.on("message", (message) => {
    console.log("Message from the server", message);
});

// socket.on("bar", (...args) => {
//     state.barEvents.push(args);
// });

