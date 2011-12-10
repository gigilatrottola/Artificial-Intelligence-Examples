var canvas;
var ctx; // canvas 2D context
var canvasWidth;
var canvasHeight;

// path coordinates, the actual position is the last value
var pathX = new Array();
var pathY = new Array();
var angle; // actual angle
// speed
var velocity;
var angle_vel; // angle velocity
var interval_time; // delta t

function clearCanvas()
{
	ctx.fillStyle = '#ffffff'; // Work around for Chrome
	ctx.fillRect(0, 0, canvasWidth, canvasHeight); // Fill in the canvas with white
	ctx.width = ctx.width; // clears the canvas 
}

function drawPath()
{
	if (pathX.length<2) return;
	ctx.strokeStyle = "#000000";
	ctx.beginPath();
	ctx.moveTo(pathX[0], pathY[0]);
	for (var i=1; i<pathX.length; i++) {
		ctx.lineTo(pathX[i], pathY[i]);
	}
	ctx.stroke();
	ctx.fillStyle = "#000000";
	for (var i=0; i<pathX.length-1; i++) {
		ctx.beginPath();
		ctx.arc(pathX[i], pathY[i], 3, 0, Math.PI*2, true);
		ctx.fill();
	}
}

function drawObject()
{
	if (pathX.length<1) return;
	ctx.fillStyle = "#00FF00";
	ctx.beginPath();
	ctx.arc(pathX[pathX.length-1], pathY[pathY.length-1], 5, 0, Math.PI*2, true);
	ctx.fill();
	ctx.strokeStyle = "#FF0000";
	ctx.beginPath();
	ctx.moveTo(pathX[pathX.length-1], pathY[pathY.length-1]);
	var x = pathX[pathX.length-1] + 6 * Math.cos(angle);
    var y = pathY[pathY.length-1] + 6 * Math.sin(angle);
	ctx.lineTo(x,y);
	ctx.stroke();
}

function redraw()
{
	clearCanvas();
	drawPath();
	drawObject();
}

function initialize()
{
	canvas = document.getElementById('canvasElem');
	if(!canvas.getContext) return;
	canvasWidth = document.height - 40;
    canvasHeight = canvasWidth;
	canvas.setAttribute('width', canvasWidth);
	canvas.setAttribute('height', canvasHeight);
	//canvas.setAttribute('id', 'canvas');
	ctx = canvas.getContext("2d");
	// mouse click event
	$('#canvasElem').click(function(e)
	{
		// read and check data
		var a = parseFloat(document.getElementById('angle').value);
		if (isNaN(a)) { alert("Invalid angle value!"); return; }
		a = a / 180.0 * Math.PI; // degrees to radians
		var v = parseFloat(document.getElementById('velocity').value);
		if (isNaN(v)) { alert("Invalid velocity value!"); return; }
		var av = parseFloat(document.getElementById('angle_vel').value);
		if (isNaN(av)) { alert("Invalid angle velocity value!"); return; }
		av = av / 180.0 * Math.PI;
		var it = parseFloat(document.getElementById('interval_time').value);
		if (isNaN(it)) { alert("Invalid step interval time value!"); return; }
		// initial position
		var mouseX = e.pageX - this.offsetLeft;
		var mouseY = e.pageY - this.offsetTop;
		// display data
		document.getElementById('x').value = mouseX;
		document.getElementById('y').value = mouseY;
		document.getElementById('angle').title = a;
		// clear previous data
		pathX = new Array(); pathX.push(mouseX);
		pathY = new Array(); pathY.push(mouseY);
		angle = a;
		velocity = v;
		angle_vel = av;
		interval_time = it;
		redraw();
	});
	// 
	$('#buttonStep').click(function(e)
	{
		if (pathX.length<1) { alert("Fill in initial data and click on initial position!"); return; }
		var x = pathX[pathX.length-1] + velocity * interval_time * Math.cos(angle);
		var y = pathY[pathY.length-1] + velocity * interval_time * Math.sin(angle);
		var a = angle + angle_vel * interval_time;
		// update actual data
		pathX.push(x);
		pathY.push(y);
		angle = a;
		// display actual data
		document.getElementById('x').value = pathX[pathX.length-1];
		document.getElementById('y').value = pathY[pathY.length-1];
		document.getElementById('angle').value = angle / Math.PI * 180.0;
		document.getElementById('angle').title = angle;
		redraw();
	});

}
