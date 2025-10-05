import { io } from "socket.io-client";

const socket = io("https://companiescenterllc.com/chat", {
  path: "/sanuxsocket/socket.io",
  transports: ["websocket"],
});
console.log("Socket instance created:", socket);

socket.on("connect", () => {
  console.log("Connected!", socket.id);
});
