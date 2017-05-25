
// read the ccontents of json file
//
function fileReaderGraphPlotter ( filename , graphtype, graphConfig, graphfn ) {

    var jsonData = [];

    // read file contents from json file
    d3.json( filename,
	     // callback function called to plot graph after all valies
	     //  are read
	     function(error, json ) {
		 if (error) return console.warn(error);
		 rowdata = json;
		 graphfn(rowdata,graphConfig);
	     }
	   );

    // just a closure in case
    return function() {return jsonData};

}


// plot the heatMap
function plotHeatMap(filename,graphtype,graphConfig) {

    var graphfn;

    // chose the graph plotting function based on the
    //  graph type in question
    switch( graphtype ){
    case "q2":
	graphfn = pltq2graph;
	// invoke the file reader and graph plotter
	fileReaderGraphPlotter(filename,graphtype,graphConfig,graphfn);
	break;
    default:
	alert("Not a valid graph to plot");
	break;
    }

    
}


//plot the q2 graph
function pltq2graph (jsonData,graphConfig) {

    // the array to be pbuild from the json object
    var dataset = [];

    // read the json data into a array
    for(var i = 0; i < jsonData.length; i++) {

	// the json 24 hour readings for a id 
	var currData = jsonData[i];

	// the 24 hr readings array 
	var dailyReadings = currData.values;

	// save the 24 hour readings into the array for graphng
	for (var j=0; j < dailyReadings.length; j++){

	    // if there are multiple readings for same
	    // id and tod then take average
	    if ( currData.key+"-"+j in dataset ) {
		
		var currCount = dataset[currData.key+"-"+j].count;
		var currReading = dataset[currData.key+"-"+j][graphConfig.zField];

		//increment the count
		dataset[currData.key+"-"+j].count++;
		
		// keep an average for the reading
		dataset[currData.key+"-"+j][graphConfig.zField] =
		    (( dataset[currData.key+"-"+j][graphConfig.zField] * currCount ) +
		     dailyReadings[j] ) / (currCount + 1);
		
	    } else {
		dataset[currData.key+"-"+j] = {};
		dataset[currData.key+"-"+j][graphConfig.yField] =currData.key;
		dataset[currData.key+"-"+j][graphConfig.xField]= +j;
		dataset[currData.key+"-"+j][graphConfig.zField]= +dailyReadings[j];
		dataset[currData.key+"-"+j]["count"]=1;
		
	    }	    
	}

    }
    
    heatMap(dataset,graphConfig.xField,graphConfig.yField,graphConfig.zField,
	    graphConfig.title,graphConfig.xLabel,graphConfig.yLabel,graphConfig.zLabel,
	    graphConfig.xMap);

}


// generic heatMap plot function
function heatMap(dataset,xField,yField,zField,graphTitle,xLabel,yLabel,zLabel,xMap) {

    var xStep = 1, yStep = 10;
    
    // add the svg element for canvas
    var svg = d3.select("body").append("svg").attr("class","heatmap");

    // get a ref to this element to get it dimensions
    var els =  document.getElementsByTagName('svg');
    var svg2 = els[els.length-1];

    // get the keys of the dataset object
    var datasetKeys = Object.keys(dataset);
    
    // set the scales for x and y axis
    var xScale;
    if ( xMap == null ) {
	xScale = d3.scale.linear()
	    .domain([d3.min(datasetKeys, function(d){return dataset[d][xField];}),
		     // the extra step is added to show the tile
		     d3.max(datasetKeys, function(d){return dataset[d][xField];}) + xStep ])
	    .range([svgLPadding,svg2.clientWidth-(1.5*svgRPadding)]).nice();
    } else {
	// Add an extra element as we need to show a tile
	xMap.push("");
	xScale = d3.scale.ordinal()
	    .domain(xMap)
	    .rangeRoundPoints([svgLPadding,svg2.clientWidth-(1.5*svgRPadding)]);
    }
    
    var yScale = d3.scale.linear()
	.domain([d3.min(datasetKeys, function(d){ return dataset[d][yField];}),
	    d3.max(datasetKeys, function(d){ return dataset[d][yField];}) ])
	.range([svg2.clientHeight-(1.5*svgBPadding),svgTPadding]).nice();


    var zScale = d3.scale.linear()
	.domain([d3.min(datasetKeys, function(d){ return dataset[d][zField];}),
	    d3.max(datasetKeys, function(d){return dataset[d][zField];})])
	.range(["white", "steelblue"]).nice();

    
    // plot the points with different symbols
    var symb = svg.selectAll(".tile")
	.data(datasetKeys)
	.enter()
	.append("rect")
	.attr("class","tile")
	.attr("x",function(d){ if ( xMap == null ) { return xScale(dataset[d][xField]);}
			       else  { return xScale(xMap[dataset[d][xField]]); }})
	.attr("y",function(d){ return yScale(dataset[d][yField]+yStep);})
    	.attr("fill",function(d){ return zScale(dataset[d][zField]);})
	.attr("width", function(d) { if ( xMap == null ) { return  xScale(xStep)-xScale(0);}
				     else  { return  xScale(xMap[xStep])-xScale(xMap[0]); }})
	.attr("height", yScale(0) - yScale(yStep));


    // create the x and y axis
    var xAxis = d3.svg.axis()
	.scale(xScale)
	.orient("bottom")
	.ticks(4);
    
    var yAxis = d3.svg.axis()
	.scale(yScale)
	.orient("left")
	.ticks(6);
    
    
    // Add the x axes to the svg
    svg.append("g")
	.attr("class","axis")
	.attr("transform","translate(0,"+ (svg2.clientHeight-(1.5*svgBPadding)  ) +")")
	.call(xAxis);

    // text label for x axes
    svg.append("text")     
        .attr("x", (svg2.clientWidth-svgLPadding-svgRPadding)/2 )
        .attr("y", svg2.clientHeight-(1.5*svgBPadding/2) )
        .style("text-anchor", "middle")
        .text(xLabel)
	.attr("class","axislabel");

    // add y axes to the svg
    svg.append("g")
	.attr("class","axis")
	.attr("transform","translate("+(svgLPadding)+",0)")
	.call(yAxis);  

    // text label for the y axis
    svg.append("text")      
        .attr("x",  0-svg2.clientHeight/2 )
        .attr("y", svgLPadding/3)
	.attr("dy","0.35em")
        .style("text-anchor", "middle")
        .text(yLabel)
	.attr("transform","rotate(-90)")
	.attr("class","axislabel");


    // Add a legend for the color values.
    var legend = svg.selectAll(".newlegend")
	.data(zScale.ticks(6).slice(1).reverse())
	.enter()
	.append("g")
	.attr("class", "newlegend")
	.attr("transform", function(d, i)
	      { return "translate(" + (svg2.clientWidth-svgRPadding ) + "," + ( svgTPadding*3 + i * 25) + ")"; });
    
    legend.append("rect")
	.attr("width", 25)
	.attr("height", 25)
    	.attr("class","tile legendlabel")
	.style("fill", zScale);

    legend.append("text")
	.attr("x", 26)
	.attr("y", 10)
	.attr("dy", ".35em")
	.text(String)
        .attr("class","legendlabel");

    svg.append("text")
	.attr("class", "legendlabel")
	.attr("x", svg2.clientWidth - (1.4*svgRPadding))
	.attr("y", svgTPadding*3-20)
	.attr("dy", ".35em")
	.text(zLabel);

    
    // Add Title
    svg.append("text")
	.attr("class","titletext")
        .attr("x", (svg2.clientWidth / 2))             
        .attr("y", svgTPadding -8) 
        .text(graphTitle);

}

// test function for js testing
function testfunction () {
    document.getElementById("demo").innerHTML = "Hello World!";
    return 10;
}
