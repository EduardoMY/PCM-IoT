"use strict";

//Something Useful
var currentX=Number(0), currentY=Number(0);
var currentTrace=Number(0), currentPoint=Number(0);
var intervalID=Number(0);
var stepsForRealisingMass=Number(300);
var amountOfSteps=0;

var T=Number(8); // duracion del paso ms, inverso de frecuencia
var dir1 = Number(9);   ////pin para direccion eje x
var paso1 = Number(8);   //pin para mandar pasos eje x
var dir2 = Number(7);   //pin para direccion eje y
var paso2 = Number(6);   //pin para mandar pasos eje y

// The program is using the Node.js built-in `fs` module
// to load the html file used to view the range finder status
var fs = require("fs");

// The program is using the Node.js built-in `path` module to find
// the file path to the html file used to view the range finder status
var path = require("path");

var mraa = require('mraa'); //require mraa
//console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the console

//
var pinDir1 = new mraa.Gpio(9);
var pinDir2 = new mraa.Gpio(7);
var pinPaso1 = new mraa.Gpio(8);
var pinPaso2 = new mraa.Gpio(6);
var pinMilk = new mraa.Gpio(5);

//Sets the direction of the Pins to Output, necessary for a digitalWrite
pinDir1.dir(mraa.DIR_OUT);
pinDir2.dir(mraa.DIR_OUT);
pinPaso1.dir(mraa.DIR_OUT);
pinPaso2.dir(mraa.DIR_OUT);
pinMilk.dir(mraa.DIR_OUT);

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
    
    app.use(bodyParser.json()); // for parsing application/json
    app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
    
    // Serve up the main web page used for the robot arm
    function index(req, res) {
	function serve(err, data) {
	    if (err) { return console.error(err); }
	    res.send(data);
	}
	fs.readFile(path.join(__dirname, "index.html"), {encoding: "utf-8"}, serve);
    }
    
    app.get("/", index);
    
    function getToHome(){
	intervalID=startMoving([[{pX: 0, pY: 0}]]);
    }
    
    function stopMoving(){clearInterval(intervalID); console.log("hasStopped");}

    function moveStep(pinDir, pinPas, dir){
	console.log("is moving");
	pinDir.write(dir);
	pinPas.write(1);
	setTimeout(function(){
	    pinPas.write(0);
	}, T/2);
    }
    
    function movementInX(paths){ return paths[currentTrace][currentPoint].pX-currentX;}
    
    function movementInY(paths){ return paths[currentTrace][currentPoint].pY-currentY;}
    
    function updateValues(paths){
	//console.log("Punto X: "+paths[currentTrace][currentPoint].pX+" Punto Y: "+paths[currentTrace][currentPoint].pY+
	//	    "  CUrrent X: "+currentX+" Current Y:"+currentY);
	console.log("==================");
	if(paths[currentTrace][currentPoint].pX==currentX && paths[currentTrace][currentPoint].pY==currentY){ //Point Done
	    console.log("Punto X: "+paths[currentTrace][currentPoint].pX+" Punto Y: "+paths[currentTrace][currentPoint].pY+
			"  CUrrent X: "+currentX+" Current Y:"+currentY);

	    if(currentPoint==0 && paths[currentTrace].length!=1){
		amountOfSteps=1;
		pinMilk.write(1);
	    }
	    if(paths[currentTrace].length == currentPoint+1){ //All points of a specific trace done
		if(paths.length==currentTrace+1){ //All traces done, finish the program
		    currentPoint=0;
		    currentTrace=0;
		    amountOfSteps=1;
		    stopMoving();
		    console.log("Termino");
		    pinMilk.write(0);
		    if(paths[currentTrace].length!=1){
			console.log("Va a casa");
			getToHome();
		    }
		}
		else { // keeps to the next trace
		    pinMilk.write(0);
		    amountOfSteps=1;
		    currentPoint=0;
		    currentTrace++;
		}
		
	    }
	    else //keeps to the next point
		currentPoint++;
	}
	
    }
    
    function startMoving(paths){
	//	console.log("should be doing");
	if(amountOfSteps==0){
	    if(movementInX(paths)!=0){//checks if needs movement in x
		moveStep(pinDir1, pinPaso1, (movementInX(paths)>0 ? 1 : 0));
		
		if(movementInX(paths)>0)
		    currentX++;
		else
		    currentX--;
	    }
	    else if(movementInY(paths)!=0){// checks if needs movement in Y
		moveStep(pinDir2, pinPaso2, (movementInY(paths)>0 ? 1 : 0));
		
		if(movementInY(paths)>0)
		    currentY++;
		else
		    currentY--;
	    }
	    updateValues(paths);
	}
	else {
	    amountOfSteps++;	
	    if(amountOfSteps==stepsForRealisingMass)
		amountOfSteps=0;
	}
    }
    
    app.post("/move", function (req, res){
//	console.log(req);
	console.log(req.params);
	console.log(req.params.id);
//	console.log(req.body);
//	console.log(req.body.name);
	//console.log(req.body.paths.length);
	intervalID=setInterval(function(){startMoving(req.body.paths);}, T);
	
	res.send("Hello");
    });
    
    app.listen(process.env.PORT || 3000);
}

function main() {
    server();
}

main();


