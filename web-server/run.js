var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

var isConnected = false;
var remoteActions = new Array();
var tmpDir = './public/tmp/';
var tmpDirHtml = './tmp/';
var tmpFrameFile = 'frame.jpg';

var base64_decode = function(base64str, file, callback) {
    var data = new Buffer(base64str, 'base64');
    fs.writeFileSync(file, data);
    callback();
}

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){

    // From web client
    isConnected = true;
    console.log('=> web client connected');

    socket.on('disconnect', function(){
        isConnected = false;
        console.log('=> web client disconnected');

        // Delete last frame
        if (fs.existsSync(tmpDir + tmpFrameFile)){
            fs.unlinkSync(tmpDir + tmpFrameFile);
        }
    });

    socket.on('mouse_click', function(res){
        console.log('=> mouse click', res);
        remoteActions.push(res);
    });

    socket.on('mouse_move', function(res){
        // Note to developer: do not test it when the client and the server are on the same computer!
        // Disabled: not working properly
        // remoteActions.push(res);
    });

    socket.on('text_input', function(res){
        console.log('=> text input', res);
        remoteActions.push(res);
    });

    socket.on('command_input', function(res){
        console.log('=> command input', res);
        remoteActions.push(res);
    });

    // From Python client
    
    socket.on('screencast', function(data, callback){
        if (isConnected) { 
            base64_decode(data, tmpDir + tmpFrameFile, function(){
                io.emit('new_frame', tmpDirHtml + tmpFrameFile + '?'+ new Date().getTime());
                callback(remoteActions);
                remoteActions = new Array();
            });
        }
    });
});

// Start server
http.listen(8080, function(){
    console.log('listening on *:8080');

    // Create temporary directory
    if (!fs.existsSync(tmpDir)){
        fs.mkdirSync(tmpDir);
    }
});