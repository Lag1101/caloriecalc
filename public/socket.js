/**
 * Created by vasiliy.lomanov on 02.06.2015.
 */


var socket = io.connect('', {
    reconnect: false
});
socket
    .on('connect', function () {
        console.log("connected");
    })
    .on('disconnect', function () {
        console.log("disconnected");
        BootstrapDialog.show({
            type: BootstrapDialog.TYPE_WARNING,
            title: 'Warning',
            message: 'Соединение разорвано. Попробуйте перезагрузить страницу',
            closable: false
        });
    })
    .on('error', function(err){
        BootstrapDialog.show({
            type: BootstrapDialog.TYPE_DANGER,
            title: 'DANGER',
            message: err.body + '\n' + 'Попробуйте перезагрузить страницу',
            closable: false
        });
    });