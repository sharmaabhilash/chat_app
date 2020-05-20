const socket = io();

const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $geoLocationButton = document.querySelector('#send-location');
const $message = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');

const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
    
    // New message element
    const $newMessage = $message.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $message.offsetHeight

    // Height of messages container
    const containerHeight = $message.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $message.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $message.scrollTop = $message.scrollHeight
    }
};

socket.on('locationMessage', (location) => {
    
    const html = Mustache.render(locationTemplate, {
        userName: location.userName,
        location: location.url,
        createdAt: moment(location.createdAt).format('hh:mm a')
    });
    $message.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('message', (message) => {
    
    const html = Mustache.render(messageTemplate, {
        userName: message.userName,
        message: message.text,
        createdAt: moment(message.createdAt).format('hh:mm a')
    });
    $message.insertAdjacentHTML('beforeend', html)
    autoscroll();
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    $sidebar.innerHTML = html;
});

document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault();

    $messageFormButton.setAttribute('disabled', 'disabled');

    var mymessage = document.getElementById("messageBox").value;
    socket.emit('sendMessage', mymessage, (message) => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
        console.log('The message was delivered', message);
    });
});

$geoLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geo location not exist');
    }

    $geoLocationButton.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (message) => {
            $geoLocationButton.removeAttribute('disabled');
            console.log('Location shared!', message);
        });
    });
});

// socket.on('counterUpdate', (count) => {
//     console.log('Counter is ', count);
// });

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('clicked');
//     socket.emit('increment');
// });

socket.emit('join', { username, room }, (error) => {
    
    if (error) {
        alert(error)
        location.href = '/'
    }
});