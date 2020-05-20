const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));
// let count = 0;

io.on('connection', (socket) => {
    console.log('New socket connection');

    socket.on('join', ({ username, room }, callback) => {
        
        const { error, user } = addUser({ id: socket.id, userName: username, room: room })

        if (error) {
            return callback(error);
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.userName} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        callback()
    });

    socket.on('sendMessage', (mymessage, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('message', generateMessage(user.userName, mymessage));
        callback('Delivered');
    });

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.userName, 'https://google.com/maps?q='+ coords.latitude + ',' + coords.longitude));
        callback('Delivered');
    });

    // socket.emit('counterUpdate', count);

    // socket.on('increment', () => {
    //     count++;
    //     //socket.emit('counterUpdate', count);
    //     io.emit('counterUpdate', count);
    // });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage(user.userName, `${user.userName} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    })
});

server.listen(port, () => {
    console.log('Server is up on port ' + port);
});