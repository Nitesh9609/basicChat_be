import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from "cors"

const port = 8080

const app = express()

const server = new createServer(app)

app.use(cors())

const io = new Server(server, {
    cors: {
        origin: "https://basic-chat-fe.vercel.app",
        methods: ["GET", "POST"],
        credentials: true
    }
})

app.get('/', (req, res) => {
    res.send("Hello World!")
})

let onlineUsers = []
io.on('connection', socket => {
    console.log(socket.id + " connected");
    // When the client sends a message to the server using socket.emit(), this event is triggered on the server side
    console.log("online user",onlineUsers);

    socket.on('userName', (data) => {

        onlineUsers.push({ userName: data, socketId: socket.id })
        io.emit('user_connected', onlineUsers);
    })

    socket.on('message', (data) => {
        console.log("message", data);
        io.to(data.room).emit('receave-message', data)

    })

    socket.on('join-room', (room) => {
        socket.join(room)
    })

    socket.on('disconnect', () => {
       const index = onlineUsers.filter((item) => {return item.socketId !== socket.id})
       onlineUsers = index
        io.emit('user_connected', index);

        // console.log(`User disconnected - ${socket.id}, after disconect ${onlineUsers}`);
    })
})

server.listen(port, () => {
    console.log(`server is runnign at ${port}`);
})