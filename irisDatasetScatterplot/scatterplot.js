
// read the ccontents of tsv file
//
function fileReaderGraphPlotter ( filename , graphtype, graphfn ) {

    var rowdata = [];

    // read file contents from tsv file
    d3.tsv( filename,
	    // accessor function to store values as number
	    function(d) {
		switch( graphtype ){
		case "q1":
		    return {
			sepalLength: +d.sepalLength,
			sepalWidth: +d.sepalWidth,
			petalLength: +d.petalLength,
			petalWidth: +d.petalWidth,
			species:d.species
		    };
		    break;
		default:
		    alert("Not a valid graph to plot");
		    return d;
		    break;
		}

	    },
	    // callback function called to plot graph after all valies
	    //  are read
	    function(error, rows) {
		rowdata = rows;
		graphfn(rowdata);
	    }
	  );

    // just a closure in case
    return function() {return rowdata};

}


// plot the scrtter plot
function plotscattergraph (filename,graphtype) {

    var graphfn;

    // chose the graph plotting function based on the
    //  graph type in question
    switch( graphtype ){
    case "q1":
	graphfn = pltq1graph;
	// invoke the file reader and graph plotter
	fileReaderGraphPlotter(filename,graphtype,graphfn);
	break;
    default:
	alert("Not a valid graph to plot");
	break;
    }

    
}


//plot the q1 graph
function pltq1graph (dataset) {

    // get the unique class values
    var classObj = {};
    for(var i = 0; i < dataset.length; i++) {
        if(dataset[i]["species"] in classObj ) {
	    continue;
        } else {
	    classObj[dataset[i]["species"]]=1;
	}
    }

    var classList = Object.keys(classObj);
    
    scattergraph(dataset,"sepalLength","sepalWidth","species",classList,"Q1 a. Sepal Length vs Width - Scale Linear",d3.scale.linear,"Sepal Length (cm)","Sepal Width (cm)");

    scattergraph(dataset,"petalLength","petalWidth","species",classList,"Q1 a. Petal Length vs Width - Scale Linear",d3.scale.linear,"Petal Length (cm)","Petal Width (cm)");

    scattergraph(dataset,"sepalLength","sepalWidth","species",classList,"Q1 c. Sepal Length vs Width - Scale Log",d3.scale.log, "Sepal Length (cm)","Sepal Width (cm)");

    scattergraph(dataset,"petalLength","petalWidth","species",classList,"Q1 a. Petal Length vs Width - Scale Log",d3.scale.log,"Petal Length (cm)","Petal Width (cm)");

    scattergraph(dataset,"sepalLength","sepalWidth","species",classList,"Q1 c. Sepal Length vs Width - Scale Power",d3.scale.pow,"Sepal Length (cm)","Sepal Width (cm)");

    scattergraph(dataset,"petalLength","petalWidth","species",classList,"Q1 a. Petal Length vs Width - Scale Power",d3.scale.pow,"Petal Length (cm)","Petal Width (cm)");

    scattergraph(dataset,"sepalLength","sepalWidth","species",classList,"Q1 c. Sepal Length vs Width - Scale Sqrt",d3.scale.sqrt,"Sepal Length (cm)","Sepal Width (cm)");

    scattergraph(dataset,"petalLength","petalWidth","species",classList,"Q1 a. Petal Length vs Width - Scale Sqrt",d3.scale.sqrt,"Petal Length (cm)","Petal Width (cm)");

}


// generic scatter plot function
function scattergraph(dataset,xField,yField,graphclass,classList,graphTitle,axisscale,xLabel,yLabel) {

    // Add Title
    d3.select("body").append("br");
    
    d3.select("body")
	.append("div")
	.append("h2")
	.append("text")
	.attr("class","titletext")
         .text(graphTitle);
    
    // add the svg element for canvas
    var svg = d3.select("body").append("svg").attr("class","scatter");

    // get a ref to this element to get it dimensions
    var els =  document.getElementsByTagName('svg');
    var svg2 = els[els.length-1];
    
    // set the scales for x and y axis
    var xScale = axisscale()
	.domain([d3.min(dataset, function(d){return d[xField];}),
		 d3.max(dataset, function(d){return d[xField];})])
	.range([0+svgLPadding+20,svg2.clientWidth-svgRPadding]).nice();

    var yScale = axisscale()
	.domain([d3.min(dataset, function(d){return d[yField];}),
		 d3.max(dataset, function(d){return d[yField];})])
	.range([svg2.clientHeight-svgBPadding,svgTPadding]).nice();

    
    // Set the x and y axes
    var formatAsPercentage = d3.format(".1%");

    var xAxis = d3.svg.axis()
	.scale(xScale)
	.orient("bottom")
	.ticks(7);

    var yAxis = d3.svg.axis()
	.scale(yScale)
	.orient("left")
	.ticks(6);
   

    // set scale for symbol size in the graph
    var rScale = d3.scale.linear()
	.domain([d3.min(dataset,function(d){return Math.sqrt(d[xField]);}),
		 d3.max(dataset,function(d){return Math.sqrt(d[xField]);})])
	.range([10,250]).nice();

    // create a ordinal scale for the classes in the data
    // to be used for symbols , colors and legend
    var symbolScale =  d3.scale.ordinal()
	.domain(classList)
	.range([ "circle", "square", "diamond", "triangleD-up", "triangle-down"]);

    // create a ordinal scale for the classes in the data
    // to be used for symbols , colors and legend
    var symbolScale =  d3.scale.ordinal()
	.domain(classList)
	.range([ "circle", "square", "diamond", "triangleD-up", "triangle-down"]);

    var colorScale =  d3.scale.category10()
	.domain(classList);
    
    // plot the points with different symbols
    var symb = svg.selectAll(".point")
	.data(dataset)
	.enter()
	.append("path")
	.attr("d", d3.svg.symbol().type(function(d) {
	    return symbolScale(d[graphclass])})
	      .size(function(d){return rScale(Math.sqrt(d[xField]));})
	     )
	.attr("transform", function(d) {
	    return "translate(" + xScale(d[xField]) + "," + yScale(d[yField]) + ")"; })
	.attr("fill",function(d){return colorScale(d[graphclass])});
    
    // Add the x axes to the svg
    svg.append("g")
	.attr("class","axis")
	.attr("transform","translate(0,"+ (svg2.clientHeight-svgBPadding) +")")
	.call(xAxis);

    // text label fro x axes
    svg.append("text")     
        .attr("x", svg2.clientWidth/2 )
        .attr("y", svg2.clientHeight-(svgBPadding/2) )
        .style("text-anchor", "middle")
        .text(xLabel)
	.attr("class","axislabel");

    // add y axes to the svg
    svg.append("g")
	.attr("class","axis")
	.attr("transform","translate("+(svgLPadding+20)+",0)")
	.call(yAxis);  

    // text label for the y axis
    svg.append("text")      
        .attr("x",  0-svg2.clientHeight/2 )
        .attr("y", svgLPadding/2)
	.attr("dy","0.35em")
        .style("text-anchor", "middle")
        .text(yLabel)
	.attr("transform","rotate(-90)")
	.attr("class","axislabel");

    
    // add legend   
    var legend = svg.append("g")
	.attr("class", "legendSymbol")
	.attr('transform', 'translate(-20,50)');    

    var rect = legend.append("rect")
	.attr("width",110)
	.attr("height",90)
	.attr("x",svg2.clientWidth-920)
	.attr("y",-22);

    // add symbol to the legend
    legend.selectAll("newlegend")
	.data(classList)
	.enter()
	.append("path")
	.attr("d", d3.svg.symbol().type(function(d) { return symbolScale(d);} )
	      .size(100)
	     )
    	.attr("transform", function(d,i) {
	    return "translate(" + (svg2.clientWidth-900) + "," + (i*20) + ")"; })
	.attr("fill", function(d) { return colorScale(d); });

   

    //add text to the legend
    legend.selectAll('text')
	.data(classList)
	.enter()
	.append("text")
	.attr("x", svg2.clientWidth - 882)
	.attr("y", function(d, i){ return i *  20 +5;})
	.text(function(d) { return d; })
	.attr("fill", function(d) { return colorScale(d); });

    d3.select("body")
	.append("div")
	.attr("class","spacer");
}



// test function for js testing
function testfunction () {
    document.getElementById("demo").innerHTML = "Hello World!";
    return 10;
}
