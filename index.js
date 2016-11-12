"use strict";

//Something Useful
var T=Number(8); // duracion del paso ms, inverso de frecuencia
var dir1 = Number(9);   ////pin para direccion eje x
var paso1 = Number(8);   //pin para mandar pasos eje x
var dir2 = Number(7);   ////pin para direccion eje y
var paso2 = Number(6);   //pin para mandar pasos eje y

// The program is using the Node.js built-in `fs` module
// to load the html file used to view the range finder status
var fs = require("fs");

// The program is using the Node.js built-in `path` module to find
// the file path to the html file used to view the range finder status
var path = require("path");

var mraa = require('mraa'); //require mraa
console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the console

//
var pinDir1 = new mraa.Gpio(9);
var pinDir2 = new mraa.Gpio(7);
var pinPaso1 = new mraa.Gpio(8);
var pinPaso2 = new mraa.Gpio(6);

//Sets the direction of the Pins to Output, necessary for a digitalWrite
pinDir1.dir(mraa.DIR_OUT);
pinDir2.dir(mraa.DIR_OUT);
pinPaso1.dir(mraa.DIR_OUT);
pinPaso2.dir(mraa.DIR_OUT);

// Starts the built-in web server for the web page
// used to view or control the arm
function server() {
    var app = require("express")();
    var bodyParser = require('body-parser')
    
    //ALLOW CROSS
    app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
    });
    
    app.use(bodyParser.json())
    
    // Serve up the main web page used for the robot arm
    function index(req, res) {
	function serve(err, data) {
	    if (err) { return console.error(err); }
	    res.send(data);
	}
	fs.readFile(path.join(__dirname, "index.html"), {encoding: "utf-8"}, serve);
    }
    
    app.get("/", index);

    app.post("/move", function (req, res){
	console.log(req.params);
	console.log(req.body.paths.length);
	console.log("Inicio for");
	for (var i=0;  i<req.body.paths.length; i++){
	    console.log("un trazo");
	    for(var ic=0; ic<req.body.paths[i].length ;ic++ ){
		console.log("un punto");
		console.log("x "+req.body.paths[i][ic].pX + "y"+req.body.paths[i][ic].pY);
	    }
	}
	console.log("fin for");
	
	app.post("/one-cw", function(){
	    setTimeout(function(){
		pinPas.write(0);
	    }, T/2);
	});
	
	/*
	setInterval(function() {
	    moveStep(pinDir1, pinPaso1, 0);
	    moveStep(pinDir2, pinPaso2, 0);
	}, T);
	*/
	res.send("Hello");
    });
    
    app.listen(process.env.PORT || 3000);
}


function moveStep(pinDir, pinPas, dir){
    dir=0;
    pinDir.write(dir);
    pinPas.write(1);
    setTimeout(function(){
	pinPas.write(0);
    }, T/2);
}

function startMoving(){
    
}

function main() {
    server();
    	setInterval(function() {
	    moveStep(pinDir1, pinPaso1, 0);
	   // moveStep(pinDir2, pinPaso2, 0);
	}, T);
}

main();


