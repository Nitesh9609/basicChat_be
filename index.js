import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from "cors"

const port = 8080

const app = express()

const server = new createServer(app)


const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
})

app.get('/', (req, res) => {
    res.send("Hello World!")
})

app.use(cors())

let onlineUsers = []
io.on('connection', socket => {
    console.log(socket.id + " connected");
    // When the client sends a message to the server using socket.emit(), this event is triggered on the server side
    
    socket.on('userName', (data) => {
        
        onlineUsers.push({ userName: data, socketId: socket.id })
        console.log("online user",onlineUsers);
        io.emit('user_connected', onlineUsers);
    })

    socket.on('message', (data) => {
        console.log("message", data);
        io.to(data.room).emit('receave-message', data)

    })

    socket.on('join-room', (room) => {
        console.log(`room joined by ${room}`);
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