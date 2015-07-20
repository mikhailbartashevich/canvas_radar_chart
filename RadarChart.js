window.RadarChart = function(initConfig) {

	var config = initConfig || {};

	var canvas = document.getElementById((config.id || 'radarChart'));

	var initChartArea = function(chart) {
		chart.minDimension = (canvas.height < canvas.width ? canvas.height : canvas.width) / 2;

		chart.initialRadius = (chart.minDimension - chart.minDimension / 4) / (chart.numberOfCircles + 1);
		chart.halfChartWidth = canvas.width / 2;
		chart.halfChartHeight = canvas.height / 2;
		chart.pointsRadius = chart.initialRadius / 10;

		chart.canvasObject.fillStyle = chart.backgroundColor;
	    chart.canvasObject.fillRect(0, 0, chart.halfChartWidth * 2, chart.halfChartHeight * 2);
	}

    var circle = function(chart, x, y, radius, color, fill) {
	    chart.canvasObject.beginPath();
	    chart.canvasObject.arc(x, y, radius, 0, toRadians(360), false);
	   
	    if(fill) {
	    	chart.canvasObject.fillStyle = color;
	    	chart.canvasObject.fill();
	    }
	    
	    chart.canvasObject.lineWidth = 2;
	    chart.canvasObject.strokeStyle = color;
	    chart.canvasObject.stroke();
	}

	var line = function(chart, initX, initY, endX, endY, lineWidth) {
		chart.canvasObject.beginPath();
	    chart.canvasObject.moveTo(initX, initY);
	    chart.canvasObject.lineTo(endX, endY);
	    chart.canvasObject.lineWidth = lineWidth || 2;
	    chart.canvasObject.strokeStyle = chart.chartColor;
	    chart.canvasObject.stroke();
	}

	var renderRadarCircles = function(chart) {
		var currentRadius = chart.initialRadius;

		for(var i = 0; i < chart.numberOfCircles; i++) {
			currentRadius += chart.initialRadius;
			circle(chart, chart.halfChartWidth, chart.halfChartHeight, currentRadius, chart.chartColor);
		}

		chart.maximumRadius = currentRadius;
	}

	var renderMainAxis = function(chart, angle, lineWidth) {
		var lineWidth = lineWidth || 1, initialRadius = chart.initialRadius * 2;

		line(chart, chart.halfChartWidth + initialRadius * Math.sin(toRadians(angle)), 
					chart.halfChartHeight - initialRadius * Math.cos(toRadians(angle)), 
				 	chart.halfChartWidth + chart.maximumRadius * Math.sin(toRadians(angle)), 
				 	chart.halfChartHeight - chart.maximumRadius * Math.cos(toRadians(angle)), 
				 	lineWidth);
	}

	var renderAxises = function(chart) {
		for (var angle = 0; angle < 360; angle += 30) {
			renderMainAxis(chart, angle);
		};
	}

	var renderMainAngleLabels = function(chart) {
		var delta = chart.initialRadius / 5;

		chart.canvasObject.textAlign = "center";
   		chart.canvasObject.textBaseline = "bottom";
  		chart.canvasObject.fillText("0°", chart.halfChartWidth, chart.halfChartHeight - chart.maximumRadius - delta);

  		chart.canvasObject.textBaseline = "top";
  		chart.canvasObject.fillText("180°", chart.halfChartWidth, chart.halfChartHeight + chart.maximumRadius + delta);

		chart.canvasObject.textAlign = "left";
  		chart.canvasObject.textBaseline = "middle";
  		chart.canvasObject.fillText("90°", chart.halfChartWidth + chart.maximumRadius + 1.5 * delta, chart.halfChartHeight);

  		chart.canvasObject.textAlign = "right";
  		chart.canvasObject.fillText("270°", chart.halfChartWidth - chart.maximumRadius - delta / 2, chart.halfChartHeight);
	}

	var renderAngleLabel = function(chart, angle) {
		chart.canvasObject.fillText(angle + "°", 
									chart.halfChartWidth + chart.maximumRadius * Math.sin(toRadians(angle)), 
									chart.halfChartHeight - chart.maximumRadius * Math.cos(toRadians(angle)));
	}

	var renderAxisesLabels = function(chart) {

		var fontHeight = Math.floor(chart.initialRadius * 0.8);
  		chart.canvasObject.font = fontHeight + "px " + chart.fontType;
  		chart.canvasObject.fillStyle = chart.chartColor;

  		renderMainAngleLabels(chart);
		
		chart.canvasObject.textAlign = "left";
  		chart.canvasObject.textBaseline = "bottom";
  		renderAngleLabel(chart, 30);
  		renderAngleLabel(chart, 60);

		chart.canvasObject.textBaseline = "top";
		renderAngleLabel(chart, 120);
  		renderAngleLabel(chart, 150);

  		chart.canvasObject.textAlign = "right";
  		renderAngleLabel(chart, 210);
  		renderAngleLabel(chart, 240);
  		
   		chart.canvasObject.textBaseline = "bottom";
  		renderAngleLabel(chart, 300);
  		renderAngleLabel(chart, 330);

	}

	var renderLimiterLine = function(chart, angle) {
		var x = chart.halfChartWidth + chart.maximumRadius * Math.sin(toRadians(angle)),
			y = chart.halfChartHeight - chart.maximumRadius * Math.cos(toRadians(angle));

		renderMainAxis(chart, angle, chart.initialRadius / 5);

		circle(chart, x, y, chart.initialRadius / 5, chart.limiterColor, true);
	}

	var renderCurrentDataPointText = function (chart, angle) {
		var fontHeight = Math.floor(chart.initialRadius * 1.8);
  		chart.canvasObject.font = fontHeight + "px " + chart.fontType;
  		chart.canvasObject.fillStyle = getDataColor(chart, angle);
  		chart.canvasObject.textAlign = "center";
   		chart.canvasObject.textBaseline = "middle";
  		chart.canvasObject.fillText(angle, chart.halfChartWidth, chart.halfChartHeight);
	}

	var getDataColor = function(chart, angle) {
		var color = chart.pointColor;

		if(angle > chart.mediumAngleLimit && angle < chart.angleLimit) {
			var color = chart.mediumBorderColor;
		} else if(angle >= chart.angleLimit) {
			color = chart.highBorderColor;
		} 

		return color;
	}

	var renderDataPoints = function(chart, data) {
		var delta = (chart.maximumRadius - chart.initialRadius * 2) / (chart.maxDataLength - 1),
			radius = chart.maximumRadius;

		for(var i =  data.length - 1; i >= 0 ; i-- ) {
			var angle = data[i].angle,
				x = chart.halfChartWidth + radius * Math.sin(toRadians(angle)),
				y = chart.halfChartHeight - radius * Math.cos(toRadians(angle));

			circle(chart, x, y, chart.pointsRadius, getDataColor(chart, angle), true);
			radius -= delta;
		}
	}

	var toRadians = function(angle) {
	 	return angle * (Math.PI / 180);
	}

	var renderChart = function(data) {

		initChartArea(this);

		renderRadarCircles(this);

		renderAxises(this);

		renderAxisesLabels(this);

		renderLimiterLine(this, this.angleLimit);

		renderDataPoints(this, data);

		if(data.length) {
			renderCurrentDataPointText(this, data[data.length - 1].angle);
		}

		return this;
	}

	return {
		angleLimit : config.angleLimit || 50,
		mediumAngleLimit : config.mediumAngleLimit || 40,

		// initialRadius : initialRadius,
		// maximumRadius : minDimension / 2 - minDimension / 5,

		numberOfCircles : config.numberOfCircles || 5,
		maxDataLength : config.maxDataLength || 10,

		fontType :  config.fontType || 'Arial',
		chartColor : config.chartColor || 'gray',
		pointColor : config.pointColor || 'white',
		mediumBorderColor : config. mediumBorderColor || 'yellow',
		highBorderColor : config.highBorderColor || '#FF0000',
		limiterColor : config.limiterColor || 'gray',
		backgroundColor : config.backgroundColor || 'black',
		// pointsRadius : initialRadius / 10,

		// halfChartWidth: canvas.width / 2,
		// halfChartHeight: canvas.height / 2,
		canvasObject : canvas.getContext('2d'), 

		renderChart : renderChart
	};
}