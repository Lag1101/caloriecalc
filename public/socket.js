/**
 * Created by vasiliy.lomanov on 02.06.2015.
 */


var socket = io.connect('', {
    reconnect: true
});
socket
    .on('connect', function () {
        console.log("connected");
    })
    .on('disconnect', function () {
        console.log("disconnected");
        socket.socket.reconnect();
    });