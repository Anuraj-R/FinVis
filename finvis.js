
//Localstorage array
var LOCALSTOCKS = [];

var stockPrices = [];
var stockNames = [];

var out_exch = [];
var out_diff = [];

var yearly = [];		//for calculation and adding up
var cumulative = [];	//value of investments at a point
var invested = []; 		//amount invested till a point
var value = [];			//Inflation adjusted amount (value)

var sum = 0;


var padding=30;
var x_axis_length=5;

Number.prototype.formatNums = function(c, d, t){
var n = this, 
    c = isNaN(c = Math.abs(c)) ? 2 : c, 
    d = d == undefined ? "." : d, 
    t = t == undefined ? "," : t, 
    s = n < 0 ? "-" : "", 
    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), 
    j = (j = i.length) > 3 ? j % 3 : 0;
   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 };

/*
     *  A = the future value of the investment/loan, including interest
        P = the principal investment amount (the initial deposit or loan amount)
        r = the annual interest rate (decimal)
        n = the number of times that interest is compounded per year
        t = the number of years the money is invested or borrowed for
        
        A = P (1 + r/n)^(nt)
        
        If compunded yearly,
        A = P (1 + r)^t
        
        
        inflation adjusted interest rate
        
        (r-i)/(1+i)
        
     */
function calculate(){
    
    var base = parseInt(document.getElementById("term_amount").value);
    var intr = parseFloat(document.getElementById("interest").value)/100;
    var terms = parseInt(document.getElementById("term_num").value);
    var infl = parseInt(document.getElementById("inflation").value)/100;
    
    x_axis_length = terms+1;
    
    //reset the arrays
    yearly      = [];
    cumulative  = [];
    invested    = [];
    
    value_yearly    = [];
    value           = [];
    
    yearly[0]       = base;
    cumulative[0]   = base;
    invested[0]     = base;
    
    value_yearly[0]    = base;
    value[0]           = base;
    
    //inflation adjusted interest. ie real change in value
    value_intr = (intr-infl)/(1+infl);
    console.log("value_intr is "+value_intr);
    sum = 0;
    value_sum = 0;
    for (var i=1; i<=terms; i++){
        var mult_factor = Math.pow(1+intr, i);
        var value_mult_factor = Math.pow(1+value_intr, i);
        
        //yearly[i] is the amount to which one installment grows in i years
        yearly[i] = parseInt(base*mult_factor); 
        value_yearly[i] = parseInt(base*value_mult_factor); 
        
        //last instalment is 1 year old, first instalment is T years old
        //Final sum is adding all values from yearly[1] to yearly[T]
        sum = sum + yearly[i];
        value_sum = value_sum + value_yearly[i];
        
        //store the sum at every year to plot the graph
        cumulative[i] = cumulative[i-1]+yearly[i];
        value[i] = value[i-1]+value_yearly[i];
    }
    
    //subtract the base from the last year.
    cumulative[terms] -= base;
    value[terms] -= base;
  
    for (var i=0; i<terms; i++){
        invested[i] = base*(i+1);
    }
    //last year has no additional investments
    if (terms>=1) invested[terms] = invested[terms-1];
    
    //document.getElementById("output").innerHTML = parseInt(sum);
    document.getElementById("output").innerHTML = cumulative[terms].formatNums(0, '.', ',');
    document.getElementById("amount_invested").innerHTML = invested[terms].formatNums(0, '.', ',');
    document.getElementById("value_after_inflation").innerHTML = value[terms].formatNums(0, '.', ',');
        
    //refresh the canvas
    refreshGraphs();
    plotAllLines();
    printArrays();
    
}

function calculateLumpGrowth(){
	    
    var base = parseInt(document.getElementById("term_amount").value);
    var intr = parseFloat(document.getElementById("interest").value)/100;
    var terms = parseInt(document.getElementById("term_num").value);
    var infl = parseInt(document.getElementById("inflation").value)/100;
    
    x_axis_length = terms+1;
    
    //reset the arrays
    yearly      = [];
    cumulative  = [];
    invested    = [];
    
    value_yearly    = [];
    value           = [];
    
    yearly[0]       = base;
    cumulative[0]   = base;
    invested[0]     = base;
    
    value_yearly[0]    = base;
    value[0]           = base;
    
    //inflation adjusted interest. ie real change in value
    value_intr = (intr-infl)/(1+infl);
    console.log("value_intr is "+value_intr);
    sum = 0;
    value_sum = 0;
    for (var i=1; i<=terms; i++){
        var mult_factor = Math.pow(1+intr, i);
        var value_mult_factor = Math.pow(1+value_intr, i);
        
        //yearly[i] is the amount to which one installment grows in i years
        yearly[i] = parseInt(base*mult_factor); 
        value_yearly[i] = parseInt(base*value_mult_factor); 
        
        //last instalment is 1 year old, first instalment is T years old
        //Final sum is adding all values from yearly[1] to yearly[T]
        //sum = sum + yearly[i];
        //value_sum = value_sum + value_yearly[i];
        
        //store the sum at every year to plot the graph
        cumulative[i] = yearly[i];
        value[i] = value_yearly[i];
    }
    
    //subtract the base from the last year.
    //cumulative[terms] -= base;
    //value[terms] -= base;
  	sum = sum + yearly[terms-1];
    for (var i=0; i<=terms; i++){
        invested[i] = base;
    }
    //last year has no additional investments
    //if (terms>=1) invested[terms] = invested[terms-1];
    
    //document.getElementById("output").innerHTML = parseInt(sum);
    document.getElementById("output").innerHTML = cumulative[terms-1].formatNums(0, '.', ',');
    document.getElementById("amount_invested").innerHTML = invested[terms-1].formatNums(0, '.', ',');
    document.getElementById("value_after_inflation").innerHTML = value[terms-1].formatNums(0, '.', ',');
        
    //refresh the canvas
    refreshGraphs();
    plotAllLines();
    printArrays();
    
}

function buildStockURL(){
	console.log("buildStockURL...");
	
	var stocks = $("#stockTable .textbox");

	var url = 'http://finance.google.com/finance/info?client=ig&q=';

	stocks.each(function(idx, li) {
	    //var exch = BSE;
	    var stkName = stocks[idx].value;
	    
	    if (stkName != ""){
	    	//search in both BSE and NSE
	    	//url += "BSE" + ":" + stkName + "," + "NSE" + ":" + stkName + ",";
	    	
	    	//query only NSE
	    	url += "NSE" + ":" + stkName + ",";
	    }
	
	});
	//remove the comma at the end
	url = url.slice(0,-1);
	console.log(url);
	return url;
}

function saveToLocal(){
	localStorage.setItem("LOCALSTOCKS", JSON.stringify(LOCALSTOCKS));
	console.log("saved to localstorage" + JSON.stringify(LOCALSTOCKS));
}

function fetchStocks(){
	console.log("fetching stocks...");
	
	//build the URL
	var stockstring = buildStockURL();
	
	//reset LOCALSTOCKS
	LOCALSTOCKS = [];
	$.ajax({
		//url: "http://finance.google.com/finance/info?client=ig&q=NSE:LUPIN,INDEXBOM:MARUTI",
		url: stockstring,
		dataType: "jsonp",
		jsonp: "callback",
		jsonpCallback: "quote"
		});
		var i = 0;
		quote = function(data) {
			console.log(data);
			$.each(data, function( key, val ){
				//$("#sensex"+i).val(data[i].l_cur)
				stockNames[i] = data[i].t;
				stockPrices[i] = data[i].l_cur;				
				out_exch[i] = data[i].e;
				out_diff[i] = data[i].c;
				
	    		//save for local storage
				LOCALSTOCKS[i] = stockNames[i];
				i++;
		});
		//callback
		saveToLocal();
		printStocks();
	};
}

function printStocks(){
	
	var out = '<tr><td >Stock</td><td >Price</td></tr>';
	
	var stocks = $("#stockTable .textbox");
	
	stocks.each(function(idx, li) {
	    var stkName = stocks[idx].value;
	    
	    
	    if (stkName != ""){
	    	//find if there is a matching stockPrice
	    	for (var i=0; i<stockNames.length; i++){
				if(stockNames[i] == stkName){
					console.log("matching entry found "+stockNames[i]);
					
					var diff = out_diff[i].slice(0,1);
					if (diff == '+'){
						diff='<span style="color:green">'+out_diff[i]+'</span>';
					}
					else{
						diff='<span style="color:red">'+out_diff[i]+'</span>';
					}
					
					
					out += '<tr><td>'+stockNames[i]
						+'</td><td>'+stockPrices[i]+diff
						+'</td></tr>';
						
					break;
				}
			}	
	    }
	
	});
	$('#outTable').html(out);
}

function plotAllLines(){
    //plotIt( yearly, 1, "blue", "linear" );
    plotIt( cumulative, 1, "blue", "linear" );
    plotIt( invested, 1, "green", "linear" );
    plotIt( value, 1, "red", "linear" );
    
    //console.log("yearly: "+ yearly);
    console.log("cumulative: "+ cumulative);
    console.log("invested: "+ invested);
    console.log("value_yearly: "+ value_yearly);
    console.log("value: "+ value);
    
    
}

function printArrays(){
    var tab = "<table class='yearlyTab' >";
    
    var dat = "<tr>";
    dat += "<td>Years</td>";
    dat += "<td>Invested</td>";
    dat += "<td>Value</td>";
    dat += "<td>Total</td>";
    dat += "</tr>";
    tab += dat;
    
    for (var i=0; i<invested.length ; i++){
        
        var dat = "<tr>";
        
        dat += "<td>"+(i)+"</td>";
        dat += "<td>"+invested[i].formatNums(0)+"</td>";
        dat += "<td>"+value[i].formatNums(0)+"</td>";
        dat += "<td>"+cumulative[i].formatNums(0)+"</td>";
        
        dat += "</tr>";
        tab += dat;
    }
    tab += "</table>";
    
    document.getElementById("outputTable").innerHTML = tab;
}

function generateLineGraph(){
    
    //Width and height
    var w = $('#graph').width();
    var h = $('#graph').height();
                
    //Create scale functions
    var xScale = d3.scale.linear()
                         .domain([0, x_axis_length ])
                         .range([padding, w - padding ]);
                         
    var YScale =    d3.scale.linear()
                         .domain([0, 100])
                         .range([h - padding, padding]);
                         
    var formatAsPercentage = d3.format(".1");

    //Define X axis
    var xAxis = d3.svg.axis()
                      .scale(xScale)
                      .orient("bottom")
                      .ticks(x_axis_length)
                      .tickFormat(function(i) {
                            return i ;
                      });

    //Define Y axis
    var yAxis = d3.svg.axis()
                      .scale(YScale)
                      .orient("left")
                      .ticks(6)
                      .tickFormat(formatAsPercentage);

    //Select the SVG where we draw the graph
    var graphsvg = d3.select("#graph");

    //Place X axis
    graphsvg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (h - padding) + ")")
        .call(xAxis)
        .selectAll("text")  
            .style("text-anchor", "end")
            //.style("font-size" , "12px")
            .attr("dx", "-.8em")
            .attr("dy", ".01em")
            .attr("transform", function(d) {
                return "rotate(-65)" 
                });
    //Place Y axis
    graphsvg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis);
        
}

function plotIt( array, scl, col, graphtype ){
    
    //get the graph
    var graphsvg = d3.select("#graph");
    //var w = document.getElementById('graph').offsetWidth;
    //var h = document.getElementById('graph').offsetHeight;
    var w = $('#graph').width();
    var h = $('#graph').height();
    
    //console.log('array length is :'+array.length);
    //console.log('width is '+w+' height is '+h);
    
    // X scale will fit all values from array[] within pixels in the plotting area(width)
    var x = d3.scale.linear().domain([0, x_axis_length-1]).range([padding, w - padding ]);
    
    // Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
    
    // automatically determining max range can work something like this
    // var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);
    // we need to have scale calculated beforehand, before calling the function
    //0-100 if scale is 1
    
    //recalculate the scale with sum+1 lakh
    var y = d3.scale.linear().domain([0, sum+100000]).range([h-padding, padding]);
    
    //var y = d3.scale.linear().domain([0, 100*scl]).range([h-padding, padding]);
    //console.log('plotting 0-'+d3.max(array));
    
    var lineFun = d3.svg.line()
            // assign the X function to plot our line as we wish
            .x(function(d,i) { 
                // verbose logging to show what's actually being done
                // console.log('Plotting X value for data point: ' + d + ' using index: ' + i + ' to be at: ' + x(i) + ' using our xScale.');
                // return the X coordinate where we want to plot this datapoint
                return x(i); 
            })
            .y(function(d) { 
                //console.log('Plotting Y value for data point: ' + d + ' to be at: ' + y(d) + " using our yScale.");
                // return the Y coordinate where we want to plot this datapoint
                return y(d); 
            })
            .interpolate(graphtype);
            
    
    graphsvg.append("svg:path")
        .attr("d", lineFun(array))
        .attr("stroke", col)
        .attr("stroke-width", 1)
        .attr("fill", "none");  
}

function drawBackground(){
    var graphsvg = d3.select("#graph");
    //var w = document.getElementById('graph').offsetWidth;
    //var h = document.getElementById('graph').offsetHeight;
    
    var w = $('#graph').width();
    var h = $('#graph').height();
    
    //fill FAFAD2 background for graph.
    //graphsvg.append("rect").attr("x",padding).attr("y",padding).attr("width",w-2*padding).attr("height",h-2*padding).style("fill","#EBEBD1");
    
    
    //var maxT = d3.max(data[type].map(function(d){ return d3.sum(d); }));  
    function tW(d){ return x(d*1); }
    var x = d3.scale.linear().domain([0, 99]).range([padding, w-padding]);
    
    
    function tH(d){ return y(d*1); }
    var y = d3.scale.linear().domain([0, 99]).range([h-padding, padding]);
    
    // draw vertical lines of the grid.
    graphsvg.selectAll(".vlines").data(d3.range(100)).enter().append("line").attr("class","vlines")
        .attr("x1",tW).attr("y1",padding)
        //.attr("x2", tW).attr("y2",function(d,i){ return (d%10 ==0 && d!=100? h+12: h)-padding;});
        .attr("x2", tW).attr("y2",function(d,i){ return h-padding;});
    
    //draw horizontal lines of the grid.
    graphsvg.selectAll(".hlines").data(d3.range(100)).enter().append("line").attr("class","hlines")
        .attr("x1",function(d,i){ return (d%10 ==0 && -6)+padding;})
        .attr("y1",tH).attr("x2", w-padding).attr("y2",tH); 
    
    // make every 10th line in the grid darker. 
    graphsvg.selectAll(".hlines").filter(function(d){ return d%10==0}).style("stroke-opacity",0.5);
    graphsvg.selectAll(".vlines").filter(function(d){ return d%10==0}).style("stroke-opacity",0.5);
    

}

function refreshGraphs(){
    $('#graph').empty();
    drawBackground();
    generateLineGraph();
}

function addRows(){
    console.log("inside addRows");
    var newRow = '<tr><td><input name="stockName" type="text" value="" class="textbox" /></td></tr>';
    $('#stockTable tbody').append(newRow);
}

