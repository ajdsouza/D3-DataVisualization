
// read the ccontents of json file
//

function fileReaderGraphPlotter ( filename , graphtype, graphfn ) {

    var rowdata = [];

    // read file contents from json file
    d3.json( filename,
	     // callback function called to plot graph after all valies
	     //  are read
	     function(error, json ) {
		 
		 if (error) return console.warn(error);
		 rowdata = json;

		 // add the drop down menu selection
		 var dropDown = d3.select("#filter")
		     .append("select")
		     .attr("id","yearselect")
		     .attr("name", "year-list")
		     .attr("title","Year");
		 
		 var years = {};

		 // Get list of years
		 rowdata.forEach(function(d){years[d[graphConfig1.zField]]=1;});
		     
		 var options = dropDown
		     .selectAll("option")
		     .data(Object.keys(years).sort())
		     .enter()
		     .append("option");

		 options
		     .text(function (d) { return d; })
		     .attr("value", function (d) { return d; });
		 
		 dropDown.on("change", handleMenuChoiceEvent )
		 
		 graphfn(2005,rowdata,graphConfig1);
		 
		 graphfn(2005,rowdata,graphConfig2);
	     }
	   );

    // just a closure in case
    return function() {return rowdata};

}


// plot the BarChart
var jsonData;
function plotBars(filename,graphtype) {

    var graphfn;

    // chose the graph plotting function based on the
    //  graph type in question
    switch( graphtype ){
    case "q5":
	graphfn = plotq5graph;
	// invoke the file reader and graph plotter
	jsonData = fileReaderGraphPlotter(filename,graphtype,graphfn);
	break;
    default:
	alert("Not a valid graph to plot");
	break;
    }
    
}


//plot the q5 graph
function plotq5graph (filterYear,jsonData,graphConfig) {

    // the array to be pbuild from the json object
    var dataset = {};

    var  jFData = jsonData;
    
    // generate a nested object from the json data in file
    // with data for all except the 5 countries filtered
    if ("yField2Choice" in graphConfig) {
	jFData = jFData
	    .filter(function(d){if (d[graphConfig.yField2] in graphConfig.yField2Choice)
				{ return true;} else {return false;}});
    }

    // generate the nested object
    if ("yField2" in graphConfig ) {
	
	dataset = d3.nest()
	    .key(function(d){return d[graphConfig.zField];})
	    .sortKeys(d3.ascending)
	    .key(function(d) {
		// Switch labels if required
		if ( graphConfig.yMap != null ) {
		    if (  d[graphConfig.yField] in graphConfig["yMap"] ) {
			return d[graphConfig.yField] = graphConfig["yMap"][d[graphConfig.yField]];
		    }
		}
		return d[graphConfig.yField];})
	    .sortKeys(d3.ascending)
	    .key(function(d){return d[graphConfig.yField2];})
	    .sortKeys(d3.ascending)
	    .rollup(function(d){return d3.sum(d,function(v){return +v[graphConfig.xField];});})	    
	    .entries(jFData);
    } else {
	dataset = d3.nest()
	    .key(function(d){return d[graphConfig.zField];})
	    .sortKeys(d3.ascending)
	    .key(function(d) {
		// Switch labels if required
		if ( graphConfig.yMap != null ) {
		    if (  d[graphConfig.yField] in graphConfig["yMap"] ) {
			return d[graphConfig.yField] = graphConfig["yMap"][d[graphConfig.yField]];
		    }
		}
		return d[graphConfig.yField];})
	    .sortKeys(d3.ascending)
	    .rollup(function(d){return d3.sum(d,function(v){return +v[graphConfig.xField];});})	    
	    .entries(jFData);
    }	

    bars(filterYear,dataset,graphConfig);

}

// handle Choice Event
function handleMenuChoiceEvent(){
    var filterYear = d3.event.target.value;

    plotq5graph(filterYear,jsonData(),graphConfig1);
    plotq5graph(filterYear,jsonData(),graphConfig2);
    
}




// draw the bar chart
function bars(filterYear,dataset,graphConfig) {

    var xField = graphConfig.xField,
	yField = graphConfig.yField,
	zField = graphConfig.zField,
	graphTitle = graphConfig.title,
	xLabel = graphConfig.xLabel,
	yLabel = graphConfig.yLabel,
	zLabel = graphConfig.zLabel;



    
    // add the svg element for canvas
    var svg;
    var svgClassName;
    if ( !( "yField2" in graphConfig) ) {
	svgClassName = "barsvg";
    } else {
	svgClassName = "barsvglarge";

	d3.selectAll(".spacer").remove();
	
	// append a div as spacer before second chart
	d3.select("body")
	    .append("div")
	    .style("width","100%")
	    .style("height","20px")
	    .attr("class","spacer");
    }

    d3.selectAll("."+svgClassName).remove();
    
    svg = d3.select("body").append("svg").attr("class",svgClassName);
    
    // get a ref to this element to get it dimensions
    var els = document.getElementsByClassName(svgClassName);
    var svg2 = els[els.length-1];
	
    var bardata = dataset
	.filter(function(d){if ( d.key == filterYear){return true;} else { return false;};})[0]
	.values;

    // the bar chart area after providing for margins
    var barChartWidth= svg2.clientWidth-svgLPadding-svgRPadding;
    var barChartHeight= svg2.clientHeight-svgTPadding-svgBPadding;
    var barWidth = barChartHeight/(bardata.length*1.1);
    var barMargin = barWidth/3;
    
    // set the scales for x and y axis
    var xScale = d3.scale.linear()
	.domain([d3.min(bardata, function(d)
			{
			    if (!("yField2" in graphConfig))
			    { return d.values;} else {
				return d3.min(d.values, function(v)
				       {
					   return v.values;   
				       })
			    }
			}),
		 d3.max(bardata, function(d)
			{
			    if (!("yField2" in graphConfig))
			    { return d.values;} else {
				return d3.max(d.values, function(v)
				       {
					   return v.values;   
				       })
			    }
			})*1.1
		])
	.range([svgLPadding,svg2.clientWidth-svgRPadding]);

    // yscale add extra ticks to take care of bar width so it
    // does not fall below x axis, increase domain length by
    // adding dummy keys
    var yRange = bardata.map(function(d) { return d.key; });
 
    yRange.push(" ");
    
    var yScale = d3.scale.ordinal()
	.domain(yRange)
	.rangeRoundPoints([svgTPadding,svg2.clientHeight-svgBPadding]);
    

    // tool tip format
    var formatPop = d3.format(",.0f");
    
    /* Initialize tooltip */
    tip = d3.tip()
	.attr('class', 'd3-tip')
	.html(function(d) { return d.key+" - "+formatPop(d.values); });
    
    var zScale;
    var yScale2;
    var barWidth2;
    var barMargin2;
    
    if (!("yField2" in graphConfig)) {

	// color scale for the bars
	var pubuColorScale = [
	    //'rgb(255,247,251)'
	    //,'rgb(236,231,242)'
	    //,'rgb(208,209,230)'
	    //'rgb(166,189,219)'
	    //,'rgb(116,169,207)'
	    //,'rgb(54,144,192)'
	    'rgb(5,112,176)'
	    ,'rgb(4,90,141)'
	    //,'rgb(2,56,88)'
	];
	
	zScale = d3.scale.linear()    
	    .domain([d3.min(bardata, function(d){return d.values;}),
		     d3.max(bardata, function(d){return d.values;})])
	    .range(pubuColorScale.reverse());
	
    } else {

	var rdylbuColorScale = [
	    'rgb(215,25,28)',
	    'rgb(253,174,97)',
	    'rgb(77,175,74)',
	    //'rgb(255,255,191)',
	    'rgb(171,217,233)',
	    'rgb(44,123,182)'];

	['rgb(228,26,28)','rgb(55,126,184)','rgb(77,175,74)','rgb(152,78,163)'];
	
	var zRange = {};
	
	bardata.map(function(d){d.values.map(function(v){zRange[v.key]=1;})});
	
	zScale = d3.scale.ordinal()
	    .domain(Object.keys(zRange).sort())
	    .range(rdylbuColorScale);

	yScale2 =  d3.scale.ordinal()
	    .domain(Object.keys(zRange).sort())
	    .rangeRoundPoints([barWidth-barMargin,0]);

	barWidth2 = (barWidth-barMargin)/(Object.keys(zRange).length*1);
	barMargin2 = barWidth/1000;
		   
	
    }
    
    /* Invoke the tip in the context of your visualization */
    svg.call(tip)
    
        
    // plot the group for each origin country
    var state = svg.selectAll(".state")
	.data(bardata)
	.enter()
	.append("g")
	.attr("class", "g")
	.attr("transform", function(d)
	      { return "translate(" +svgLPadding+", "
		+ (yScale(d.key) - (yScale(yRange[1])-yScale(yRange[0]))/3) + ")"; });
    

    // if single bar for origin then draw rect
    if (!("yField2" in graphConfig)) {

	state
	    .selectAll(".bars")
	    .data(function(d) { return [d]; })
	    .enter()
	    .append("rect")
	    .attr("class","bars")
	    .attr("width", function(d) {return xScale(d.values)-xScale(0);})
	    .attr("height", function(d) { return barWidth-barMargin; })
	    .style("fill", function(d) { return zScale(d.values); })
	    .on('mouseover', tip.show)
	    .on('mouseout', tip.hide);

    } else {

	state
	    .selectAll(".bars")
	    .data(function(d) { return d.values; })
	    .enter()
	    .append("rect")
	    .attr("class","bars")
	    .attr("width", function(d) {return xScale(d.values)-xScale(0);})
	    .attr("y", function(d) { return yScale2(d.key); })
	    .attr("height", function(d) { return barWidth2-barMargin2; })
	    .style("fill", function(d) { return zScale(d.key); })
	    .on('mouseover', tip.show)
	    .on('mouseout', tip.hide);

    }
    




    // create the x and y axis
    var xAxis = d3.svg.axis()
	.scale(xScale)
	.orient("bottom")
	.ticks(10)
    	.tickSubdivide(true)
	.tickSize(6, 3, 0);
    
    var yAxis = d3.svg.axis()
	.scale(yScale)
	.orient("left")
	.ticks(15)
    	.tickSubdivide(true)
	.tickSize(6, 3, 0);
    
    
    // Add the x axes to the svg
    svg.append("g")
	.attr("class","axis")
	.attr("transform","translate(0,"+ (svg2.clientHeight-svgBPadding) +")")
	.call(xAxis);

    // text label for x axes
    svg.append("text")     
        .attr("x", barChartWidth+svgLPadding )
        .attr("y", barChartHeight+svgTPadding*.9 )
        .text(xLabel)
    	.style("text-anchor","end")
	.attr("class","axislabel");

    // add y axes to the svg
    svg.append("g")
	.attr("class","axis")
	.attr("transform","translate("+svgLPadding+",0)")
	.call(yAxis);  

    // text label for the y axis
    svg.append("text")      
        .attr("x", svgLPadding )
        .attr("y", svgTPadding-25 )
        .text(yLabel)
	.style("text-anchor","middle")
	.attr("class","axislabel");


    // Add a legend for the color values.
    if ( graphConfig.legend ) {
	
	var legend = svg.selectAll(".newlegend")
	    .data(zScale.domain().slice().reverse())
	    .enter()
	    .append("g")
	    .attr("class", "newlegend")
	    .attr("transform", function(d, i)
		  { return "translate(" + (svg2.clientWidth-svgRPadding*5 ) + ","
		    + ( svgTPadding*1 + i * 25) + ")"; });
	
	legend.append("rect")
	    .attr("width", 25)
	    .attr("height", 25)
    	    .attr("class","tile legendlabel")
	    .style("fill", zScale);

	legend.append("text")
	    .attr("x", 30)
	    .attr("y", 10)
	    .attr("dy", ".35em")
	    .style("text-anchor", "start")
	    .text(function(d){return d;})
            .attr("class","legendlabel");
    }
    
    // Add Title
    svg.append("text")
	.attr("class","titletext")
        .attr("x", (svg2.clientWidth / 2))             
        .attr("y", svgTPadding/4) 
        .text(graphTitle);

}


