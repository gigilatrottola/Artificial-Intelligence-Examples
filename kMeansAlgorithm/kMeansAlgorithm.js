var canvas;
var ctx; // canvas 2D context
var canvasWidth;
var canvasHeight;
var onClickPutData = true; // boolean: true if data, false if cluster center

function setSwitchButtonText() {
	if (onClickPutData) {
		document.getElementById('buttonSwitchDataOrClusterCenter').value = "data point";
	} else {
		document.getElementById('buttonSwitchDataOrClusterCenter').value = "cluster center";
	}
}

// coordinates of data points:
var dataX = new Array();
var dataY = new Array();
// coordinates of cluster centers:
var ccX = new Array();
var ccY = new Array();
// association of data to cluster centers
// the value is the index of the associated cluster center
var dataCC = new Array();

function clearCanvas()
{
	ctx.fillStyle = '#ffffff'; // Work around for Chrome
	ctx.fillRect(0, 0, canvasWidth, canvasHeight); // Fill in the canvas with white
	ctx.width = ctx.width; // clears the canvas 
}

function drawDataPoints()
{
	ctx.fillStyle = "#000000";
	for (var i=0; i<dataX.length; i++) {
		ctx.beginPath();
		ctx.arc(dataX[i], dataY[i], 3, 0, Math.PI*2, true);
		ctx.fill();
	}
}

function drawClusterCenters()
{
	ctx.fillStyle = "rgba(255,0,0,0.7)";
	for (var i=0; i<ccX.length; i++) {
		ctx.beginPath();
		ctx.arc(ccX[i], ccY[i], 5, 0, Math.PI*2, true);
		ctx.fill();
	}
}

function drawAssociations()
{
	ctx.strokeStyle = "rgba(255,0,0,0.7)";
	for (var i=0; i<dataCC.length; i++)
	{
		ctx.beginPath();
		ctx.moveTo(dataX[i], dataY[i]);
		ctx.lineTo(ccX[dataCC[i]], ccY[dataCC[i]]);
		ctx.stroke();
	}
}

function associateDataToClusterCenters()
{
	if (dataX.length==0 || ccX.length==0) return;
	dataCC = new Array(); // clear previous associations
	for (var di=0; di<dataX.length; di++)
	{
		var closestCCindex = 0;
		var closestDistanceSquare = Math.pow( dataX[di]-ccX[closestCCindex] , 2) + Math.pow( dataY[di]-ccY[closestCCindex] , 2);
		for (var cci=1; cci<ccX.length; cci++)
		{
			var distanceSquare = Math.pow( dataX[di]-ccX[cci] , 2) + Math.pow( dataY[di]-ccY[cci] , 2);
			if (distanceSquare<closestDistanceSquare)
			{
				closestCCindex = cci;
				closestDistanceSquare = distanceSquare;
			}
		}
		dataCC[di] = closestCCindex;
	}
	redraw();
}

function moveClusterCenters()
{
	// for all cluster centers calculate:
	var xSum = new Array(); // x coordinate of points for cluster center
	var ySum = new Array(); // y coordinate of points for cluster center
	var nSum = new Array(); // number of points for cluster center
	for (var i=0; i<ccX.length; i++) // initialize
	{
		xSum[i] = 0;
		ySum[i] = 0;
		nSum[i] = 0;
	}
	for (var i=0; i<dataX.length; i++)
	{
		xSum[dataCC[i]] += dataX[i];
		ySum[dataCC[i]] += dataY[i];
		nSum[dataCC[i]]++;
	}
	for (var i=0; i<ccX.length; i++) // set the new cluster center positions
	{
		if (nSum[i]>0)
		{
			ccX[i] = xSum[i] / nSum[i];
			ccY[i] = ySum[i] / nSum[i];
		} else {
			// no data point was associated with this cluster center
		}
	}
	redraw();
}

function removeClusterCentersWithNoData()
{
	if (dataCC.length==0) {
		alert("Data was not yet associated to cluster centers.");
		return;
	}
	var nSum = new Array(); // number of points for cluster center
	for (var i=0; i<ccX.length; i++) nSum[i] = 0;
	for (var i=0; i<dataCC.length; i++) nSum[dataCC[i]]++;
	var deletedCount = 0;
	for (var i=0; i<nSum.length; i++) {
		if (nSum[i]==0) {
			// the i-th cluster center has no data, delete it
			ccX.splice(i,1);
			ccY.splice(i,1);
			deletedCount++;
		}
	}
	if (deletedCount>0) {
		dataCC = new Array(); // clear associations because indexes became invalid
		associateDataToClusterCenters();
		redraw();
	}
}

function redraw()
{
	clearCanvas();
	drawDataPoints();
	drawClusterCenters();
	drawAssociations();
}

function initialize()
{
	setSwitchButtonText();
	canvas = document.getElementById('canvasElem');
	if(!canvas.getContext) return;
	canvasWidth = document.width * 0.8;
    canvasHeight = document.height * 0.8;
	canvas.setAttribute('width', canvasWidth);
	canvas.setAttribute('height', canvasHeight);
	//canvas.setAttribute('id', 'canvas');
	ctx = canvas.getContext("2d");
	// mouse click event
	$('#canvasElem').click(function(e)
	{
		var mouseX = e.pageX - this.offsetLeft;
		var mouseY = e.pageY - this.offsetTop;
		if (onClickPutData) {
			// new data point
			dataX.push(mouseX);
			dataY.push(mouseY);
		} else {
			// new cluster center
			ccX.push(mouseX);
			ccY.push(mouseY);
		}
		redraw();
	});
	// switch between data and cluster center
	$('#buttonSwitchDataOrClusterCenter').click(function(e)
	{
		onClickPutData = !onClickPutData;
		setSwitchButtonText();
	});
	//
	$('#buttonRemoveDataPoints').click(function(e)
	{
		dataX = new Array();
		dataY = new Array();
		dataCC = new Array();
		redraw();
	});
	//
	$('#buttonRemoveClusterCenters').click(function(e)
	{
		ccX = new Array();
		ccY = new Array();
		dataCC = new Array();
		redraw();
	});
	// associate cluster centers with data points
	$('#buttonAssociateDataToCC').click(function(e)
	{
		associateDataToClusterCenters();
	});
	// move cluster centers to the center of associated data clusters
	$('#buttonMoveCC').click(function(e)
	{
		moveClusterCenters();
	});
	// remove cluster centers with no associated data points
	$('#buttonRemoveCCwithNoData').click(function(e)
	{
		removeClusterCentersWithNoData();
	});
}
