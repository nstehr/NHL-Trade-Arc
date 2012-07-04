/**
* Nathan Stehr
* 
**/

//simple viewmodel used for now to represent a trade, for updating
//the info box
function TradeViewModel() {
    this.tradeDate = ko.observable();
    this.teamA = ko.observable();
    this.teamB = ko.observable();
    this.teamACompensation = ko.observableArray();
    this.teamBCompensation = ko.observableArray();
}

var viewModel = new TradeViewModel();

// Activates knockout.js
ko.applyBindings(viewModel);


$.getJSON('static/data.json', function(data) {
 renderTradeChart(data);
});

function renderTradeChart(jsondata){
	
	var teams = jsondata['teams'];
	var trades = jsondata['trades'];

    /**
	*also tried: 1280x960
	**/
	var chartWidth = 1100; 
	var chartHeight = 768;
	
	//sets up the basic container for the visualization
	var chart = d3.select("#trades").append("svg")
	     .attr("class", "chart")
	     .attr("width", chartWidth)
	     .attr("height", chartHeight)
	
	var x = d3.scale.ordinal()
	    .domain(teams)
	    .rangeBands([0,chartWidth]);
	//put the team logo's near the bottom of the visualization
	var y = chartHeight * 0.70;
	
	var colour = d3.scale.category20c();
	
	var tradeSizes = $.map(trades,function(value,index){
			return value.team_a_comp.length + value.team_b_comp.length;
		});
    //scale used for line thickness, map to widths between 5 and 25
	var tradeSizeScale = d3.scale.linear()
	     .domain([d3.min(tradeSizes),d3.max(tradeSizes)])
	     .range([5,25]);
	
	var teamGroup = chart.append("g");
	//plot the team logos along the x-axis
	teamGroup.selectAll("image")
	     .data(teams)
	     .enter().append("image")
	     .attr("y",y)
	     .attr("x",x)
	     .attr("width","60px")
	     .attr("height","31px")
	     .attr("xlink:href",function(d,i) { return teams[i];} )
		 //fades out all other trades, except for ones involving this team
		 .on("mouseover", fade(.1,teams))
		 //brings all the faded out trades back to normal opacity
		 .on("mouseout", fade(1,teams));
	

	var arcGroup = chart.append("g");
	//draw the arcs from one team to the other
	//to represent a trade
	arcGroup.selectAll("path")
	     .data(trades)
	     .enter().append("path")
	     .attr("d",function(d,i){
		          //x2 is always the rightmost, so 
		          //swap the values if neccessary
				 var team_a_x =  x(d.team_a);  
		          var team_b_x = x(d.team_b);
		          if(team_a_x > team_b_x){
					x1 = team_b_x;
					x2 = team_a_x;
				  }
				  else{
					x1 = team_a_x;
					x2 = team_b_x;
				}
				  //start the arc at the middle of the logo
				  x1 = x1 + 30;
				  x2 = x2 + 30;
				  //qick calculation for the arc.  The closer the
				  //teams are to each other (on the axis), the 
				  //smaller the radii need to be
				  val = (x2 - x1)/2;
		          return "M" + x1 + ","+y+" A "+ val +","+ val +" 0 0 1 " + x2 + ","+y
		                })
		 .attr("stroke", function(d,i){return colour(i);})
		 //set the line thickness based on the 'size' of the trade.  
		 //the more players/picks exchanged, the thicker the line
		 .attr("stroke-width",function(d,i){v = tradeSizeScale(d.team_a_comp.length+d.team_b_comp.length);return v;})
		 .attr("fill","none") 
		//on click, update the view model
		 .on("click",function(d,i){updateViewModel(d);});

}
//based on code from: http://mbostock.github.com/d3/ex/chord.html
function fade(opacity,teams) {
   return function(g, i) {
    //fade the paths 
    var paths = d3.select("#trades").selectAll("path")
         .filter(function(d) {
           return d.team_a != teams[i] && d.team_b != teams[i];
         });
    paths.transition().style("opacity", opacity);
    
    //fade the images
    //these are the trades that go with the selected team
	var items = $.grep(d3.select("#trades").selectAll("path").data(),function (item) {
	    return $.inArray(item, paths.data()) < 0;
	});
    //get the team a and team b of the trade
    var involvedTeams = $.map(items,function(value,index){
	    return [value.team_a,value.team_b];
       });
    //grab all the images that aren't in the list
    //of teams built above
    d3.select("#trades").selectAll("image")
         .filter(function(d){
				return $.inArray(d,involvedTeams) == -1;
	}).transition().style("opacity", opacity);
   };
 }

function updateViewModel(trade){
	viewModel.tradeDate(trade.date);
	viewModel.teamA(trade.team_a.replace("medium","small"));
	viewModel.teamACompensation(trade.team_a_comp);
	viewModel.teamBCompensation(trade.team_b_comp);
	viewModel.teamB(trade.team_b.replace("medium","small"));
}