const users = [];

const addUser = ({ id, userName, room }) => {
    // Clean the data
    userName = userName.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if(!userName || !room) {
        return {
            error: 'Username and room is required!'
        };
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.userName === userName;
    });

    // Validate username
    if (existingUser) {
        return {
            error: 'USername is in use!'
        };
    }

    // Store user
    const user = { id, userName, room };
    users.push(user);
    return { user };
};

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
};

const getUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if(index !== -1) {
        return users[index];
    }

    return [];
};

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    const usersInRoom = users.filter((user) => {
        return user.room === room;
    });

    return usersInRoom;
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}