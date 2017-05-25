
//
// Sunburst for refugee data
//  Inspired and leveraged code from d3 examples site from various implementations of sunburst
//
//

// read the ccontents of json file
//

function fileReadAndPlot ( filename , graphfn ) {
    
    var rowdata = [];
    
    // read file contents from json file
    d3.json( filename,
	     // callback function called to plot graph after all valies
	     //  are read
	     function(error, json ) {
		 
		 if (error) return console.warn(error);
		 rowdata = json;
		 
		 var years = {};
		 
		 // Get list of years
		 rowdata.forEach(function(d){years[d[graphConfig.zField]]=d[graphConfig.zField];});
		 
		 // Add All years
		 years["All"]=0;
		 
		 // Latest year first by default
		 function compare(a,b) {
		     if (years[a] < years[b])
			 return 1;
		     if (years[a] > years[b])
			 return -1;
		     return 0;
		 };
		 
		 var ySorted = Object.keys(years).sort(compare);
		 
		 var options = d3.select("#yearselect")
		     .selectAll("option")
		     .data(ySorted)
		     .enter()
		     .append("option");
		 
		 options
		     .text(function (d) { return d; })
		     .attr("value", function (d) { return years[d]; });
		 
		 filterYear = years[ySorted[0]];
		 sunType = "destination";
		
		 sunburst();		 
		 
	     }
	   );
    
    // just a closure in case
    return function() {return rowdata};
    
}


// configure the sunburst chart data structures
function configureInitial() {
      
    // append a div as spacer before second chart
    d3.select("body")
	.append("div")
	.style("width","100%")
	.style("height","20px")
	.attr("class","spacer");
        
        
    /* Initialize tooltip */
    tip = d3.tip()
    	.attr('class', 'd3-tip')
	.html(function(d) {
	    var obj = d;
	    var titlelabel = d.key;
	    while ( "parent" in obj ){
		obj = obj.parent;
		titlelabel = obj.key+"->"+titlelabel;
	    }
	    return titlelabel+"="+d.value;
	});

    // get a handle to dropDown
    dropDown = d3.select("#filter").select("#yearselect");
 
 
}



// configure the sunburst chart data structures
function configureSunBurstSVG() {
       
    // add the svg element for canvas
    var svgClassName = "sunburst";
    
    d3.selectAll("."+svgClassName).remove();

    svg = d3.select("body").append("svg").attr("class",svgClassName);
    
    // get a ref to this element to get it dimensions
    var els = document.getElementsByClassName(svgClassName);
    svg2 = els[els.length-1];

    // the bar chart area after providing for margins
    radius = Math.min(svg2.clientWidth-svgLPadding-svgRPadding,svg2.clientHeight-svgTPadding-svgBPadding)/2;

    // set the scales for x and y axis
    xScale = d3.scale.linear().range([0,2*Math.PI]);        
    zScale = d3.scale.category20c();
    yScale = d3.scale.sqrt().range([0,radius]);
    
      
    /* Invoke the tip in the context of your visualization */
    svg.call(tip);
       
    // define a partion with value function to get values
    partition = d3.layout.partition()
	.value(function(d) {return d.values;})
	.children(function(d) { return d.values;});
    
    
    // define a arc
    arc = d3.svg.arc()
	.startAngle( function(d) {return Math.max(0, Math.min(2*Math.PI,xScale(d.x)));} )
	.endAngle(  function(d) {return Math.max(0, Math.min(2*Math.PI,xScale(d.x + d.dx)));} )
	.innerRadius(  function(d) {return Math.max(0,yScale(d.y));} )
	.outerRadius(  function(d) {return Math.max(0,yScale(d.y+d.dy));});
    
    // Add a group to svg and transform center of svg as 0,0
    g = d3.select("."+svgClassName)
	.append("g")
	.attr("class", "g")
	.attr("transform", "translate(" +svg2.clientWidth/2+ ", " +svg2.clientHeight/2+")" );


    // handle the selection of a new year 
    dropDown.on("change", onDropDown);
    
    // handle radio button
    d3.select("#radiobutton").selectAll("input").on("change",onRadioButton);
    
    
}




// draw the bar chart
function sunburst()
{
    
    // the array to be pbuild from the json object    
    var dataset;

    if ( sunType === "destination" ) {
	
	sunTypeLabel = "by Destination";

	dataset = d3.nest()
	.key(function(d){return d[graphConfig.zField];})
	.sortKeys(d3.descending)
	.key(function(d) {
	    // Switch labels if required
	    if ( graphConfig.yMap != null ) {
		if (  d[graphConfig.yField] in graphConfig["yMap"] ) {
		    return d[graphConfig.yField] = graphConfig["yMap"][d[graphConfig.yField]];
		}
	    }
	    return d[graphConfig.yField];})
	.sortKeys(d3.ascending)
	.key(function(d){return d[graphConfig.xField];})
	.sortKeys(d3.ascending)
	.rollup(function(d){return d3.sum(d,function(v){return +v[graphConfig.vField];});})
            .entries(jsonData());
    } else {

	sunTypeLabel = "by Origin";
	
	dataset = d3.nest()
	    .key(function(d){return d[graphConfig.zField];})
	    .sortKeys(d3.descending)
	    .key(function(d){return d[graphConfig.xField];})
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
	    .rollup(function(d){return d3.sum(d,function(v){return +v[graphConfig.vField];});})
            .entries(jsonData());
    }

    
    // filter the year if required
    var sundata = dataset;

    
    filterYearLabel = filterYear;

    // Filter year
    if ( filterYear == 0 ) {
	filterYearLabel = "1999-2015";
    }

    // filter data for that year
    if ( filterYear != 0 ) {
	sundata = dataset
	    .filter(function(d){if ( d.key == filterYear){return true;} else { return false;};})[0]
	    .values;
    }

    // form the data structure as expected by the partiton api
    sundata = { "key": "Refugees", "values": sundata };
    rootNode = sundata;
    

    // generate a root title
    rootlabel='';
    
    // plot the group for each origin country
    sunb = g
	.selectAll("path")
        .data(partition.nodes(rootNode))
        .enter()
        .append("path")
	.attr("d",arc)
        .attr("class", "arc")
    	.style("fill", function(d)
	       { return zScale( ((Object.prototype.toString.call(d.values) === '[object Array]') ?
				 d:d.parent).key); })
	.on('mouseover', tip.show)
	.on('mouseout', tip.hide)
    	.on('click',click);
        
    
    // Add a legend for the color values.
    if ( ( 'legend' in graphConfig ) && (graphConfig.legend ) ) {
	
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
    document.title = graphConfig.title+" "+sunTypeLabel+" - "+filterYearLabel+" "+rootlabel;
    document.getElementsByClassName("graphtitle")[0].innerHTML =
	graphConfig.title+" "+sunTypeLabel+" - "+filterYearLabel+" "+rootlabel;
    
    
}




// on click transition the data to the clicked
// segment as the rootNode
function click (d) {	
    rootNode = d;
    
    // form the new root title label
    var obj = d;
    rootlabel = d.key;
    while ( "parent" in obj ){
	obj = obj.parent;
	rootlabel = obj.key+"->"+rootlabel;
    }
    
    sunb.transition()
	.duration(500)
	.attrTween("d", arcTween(d));

    // Add Title
    document.title = graphConfig.title+" "+sunTypeLabel+" - "+filterYearLabel+" "+rootlabel;
    document.getElementsByClassName("graphtitle")[0].innerHTML =
	graphConfig.title+" "+sunTypeLabel+" - "+filterYearLabel+" "+rootlabel;
    
}



// When zooming: interpolate the scales.
function arcTween (d) {
    var xd = d3.interpolate(xScale.domain(), [d.x, d.x + d.dx]),
	    yd = d3.interpolate(yScale.domain(), [d.y, 1]),
	yr = d3.interpolate(yScale.range(), [d.y ? 20 : 0, radius]);
    return function(d, i) {
	return i ? function(t) { return arc(d); }
	: function(t)
	{ xScale.domain(xd(t));
	  yScale.domain(yd(t)).range(yr(t));
	  return arc(d); };
    };
}


// on selecting a year from drop down box
function onDropDown() {
    filterYear = d3.event.target.value;
    configureSunBurstSVG();
    sunburst();
}


// on choosing a radiobutton
function onRadioButton() {

    sunType = this.value === "destination"
        ? function() { return "destination"; }: function(d) { return "origin"; };
    
    configureSunBurstSVG();
    sunburst();
    //path
    //    .data(partition.value(value).nodes)
    //	.transition()
    //      .duration(1000)
    //    .attrTween("d", arcTweenData);
    
}

d3.select(self.frameElement).style("height", "800px");

