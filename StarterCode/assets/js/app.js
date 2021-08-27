// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 700;

// Define chart margins
var margin = {
    top: 20,
    right: 40,
    bottom: 100,
    left: 100
};

// Define dimensions of the chart
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Select body, append SVG, and set dimensions
var svg = d3.select( "#scatter")
    .append( "svg")
    .attr( "width", svgWidth)
    .attr( "height", svgHeight)
    .attr( "fill", "white");

// Append group area, then set margins
var chartGroup = svg.append( "g")
    .attr( "transform", `translate( ${margin.left}, ${margin.top})`);

// Set initial axis names
var xLabel = "poverty"
var yLabel = "healthcare"

// Set up second SVG for correlation area
var svg2Width = 960;
var svg2Height = 100;

// Define chart margins
var margin2 = {
    top: 40,
    right: 10,
    bottom: 10,
    left: 10
};

// Define dimensions of chart area
var dataWidth = svg2Width - margin.left - margin.right;
var dataHeight = svg2Height - margin.top - margin.bottom;

// Select body, append SVG area to it, and set its dimensions
var svg2 = d3.select( "#linRegress")
    .append( "svg")
    .attr( "width", svg2Width)
    .attr( "height", svg2Height)
    .attr( "fill", "white");

// Load data from .csv file
d3.csv( "assets/data/data.csv").then( function( data) {

    var statesData = data;
    // Print the data
    console.log( statesData);

    // Parse data and cast to numeric
    statesData.forEach( function( data) {
        data.poverty    = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age        = +data.age;
        data.smokes     = +data.smokes;
        data.obesity    = +data.obesity;
        data.income     = +data.income;
    });
    
    // Configure linear scale for X
    var xLinearScale = d3.scaleLinear()
        .range([0, chartWidth])
        .domain([d3.min( statesData, data => data[xLabel]) - 2, d3.max( statesData, data => data[xLabel]) + 2]);

    // Configure linear scale for Y
    var yLinearScale = d3.scaleLinear()
        .range([chartHeight, 0])
        .domain([d3.min( statesData, data => data[yLabel]) - 2, d3.max( statesData, data => data[yLabel]) + 2]);

    // Initialize functions
    var bottomAxis = d3.axisBottom( xLinearScale);
    var leftAxis = d3.axisLeft( yLinearScale);
    
    // Append x and y axes
    var xAxis = chartGroup.append( "g")
        .attr( "transform", `translate(0, ${chartHeight})`)
        .call( bottomAxis);

    var yAxis = chartGroup.append( "g")
        .call( leftAxis);

    // Create scatterplot
    var circlesGroup = chartGroup.selectAll( "g circle")
        .data(statesData)
        .enter()
        .append( "g")

    var circleLoc = circlesGroup.append( "circle")
        .attr("cx", d => xLinearScale(d[xLabel]))
        .attr("cy", d => yLinearScale(d[yLabel]))
        .attr("r", 17)
        .classed("stateCircle", true);   

    // Add labels
    var circleLabel = circlesGroup.append( "text")
        .text( d => d.abbr)
        .attr( "dx", d => xLinearScale(d[xLabel]))
        .attr( "dy", d => yLinearScale(d[yLabel]) + 5)
        .classed( "stateText", true);

    // Create group for x-Axis labels
    var xlabelsGroup = chartGroup.append( "g")
        .attr( "transform", `translate(${chartWidth / 2}, ${chartHeight})`);

    var povertyL = xlabelsGroup.append( "text")
        .attr( "x", 0)
        .attr( "y", 40)
        .attr( "value", "poverty")
        .text( "In Poverty (%)")
        .classed( "active", true);

    var ageL = xlabelsGroup.append( "text")
        .attr( "x", 0)
        .attr( "y", 60)
        .attr( "value", "age")
        .text( "Age (Median)")
        .classed("inactive", true);

    var incomeL = xlabelsGroup.append( "text")
        .attr( "x", 0)
        .attr( "y", 80)
        .attr( "value", "income")
        .text( "Household Income (Median)")
        .classed("inactive", true);

    // Create group for y-Axis labels
    var ylabelsGroup = chartGroup.append( "g");

    var healthL = ylabelsGroup.append( "text")
        .attr( "transform", "rotate(-90)")
        .attr( "x", -(chartHeight / 2))
        .attr( "y", -40)
        .attr( "value", "healthcare")
        .text( "Lacks Healthcare (%)")
        .classed( "active", true);

    var smokerL = ylabelsGroup.append( "text")
        .attr( "transform", "rotate(-90)")
        .attr( "x", -(chartHeight / 2))
        .attr( "y", -60)
        .attr( "value", "smokes")
        .text( "Smokes (%)")
        .classed( "inactive", true);

    var obeseL = ylabelsGroup.append( "text")
        .attr( "transform", "rotate(-90)")
        .attr( "x", -(chartHeight / 2))
        .attr( "y", -80)
        .attr( "value", "obesity")
        .text( "Obese (%)")
        .classed( "inactive", true);

    
    // Append group area and set margins
    var statsGroup = svg2.selectAll( "text")
        .data([1])
        .enter()
        .append( "text")
        .attr( "transform", `translate(${margin2.left}, ${margin2.right})`);

    // set x/y variables for correlation coefficient and linRegress
    var xArr = statesData.map( function( data) {
        return data[xLabel];
    });
    var yArr = statesData.map( function( data) {
        return data[yLabel];
    });

    var createLine = d3.line()
        .x( data => xLinearScale(data.x))
        .y( data => yLinearScale(data.y));

    var regressPoints = regressionSetup( statesData, xLabel, yLabel, xArr);

    var plotRegress = chartGroup.append( "path")
        .attr( "class", "plot")
        .attr( "stroke", "purple")
        .attr( "stroke-width", "1")
        .attr( "fill", "none")
        .attr( "d", createLine( regressPoints));

    // Set up correlation coefficient
    var corrCoeff = pearson(xArr, yArr);

    // Add the SVG text element
    var statsText = statsGroup
        .attr( "x", 50)
        .attr( "y", 50)
        .text( "Correlation Coefficient: " + corrCoeff.toFixed(6))
        .attr( "fill", "black");
        
// x-axis labels event listener
xlabelsGroup.selectAll( "text")
.on("click", function() {
    var value = d3.select(this).attr( "value");
    if (value !== xLabel) {
        xLabel = value;

        var xArr = statesData.map( function( data) {
        return data[xLabel];
        });
        xLinearScale = xScale( statesData, xLabel);
        yLinearScale = yScale( statesData, yLabel);

        // Update x-axis with transition
        xAxis = renderXAxes( xLinearScale, xAxis);

        // Update circles with new x-values
        circleLoc = renderXCircles( circleLoc, xLinearScale, xLabel);

        // Update circles text with new x-values
        circleLabel = renderXText( circleLabel, xLinearScale, xLabel);

        // Update linear regression line
        plotRegress = renderRegression( statesData, plotRegress, xLinearScale, yLinearScale, xLabel, yLabel, xArr);

        // Update correlation coefficient
        var corrCoeff = pearson( xArr, yArr);

        var statsText = statsGroup
            .attr( "x", 50)
            .attr( "y", 50)
            .text( "Correlation Coefficient: " + corrCoeff.toFixed(6))
            .attr( "fill", "black");

        // Update tooltips
        circlesGroup = updateToolTip( circlesGroup, xLabel, yLabel);

        // Change to bold text when selected
        if (xLabel === "age") {
            povertyL
                .classed( "active", false)
                .classed( "inactive", true);
            ageL
                .classed( "active", true)
                .classed( "inactive", false);
            incomeL
                .classed( "active", false)
                .classed( "inactive", true);
        }
        else if (xLabel === "income") {
            povertyL
                .classed( "active", false)
                .classed( "inactive", true);
            ageL
                .classed( "active", false)
                .classed( "inactive", true);
            incomeL
                .classed( "active", true)
                .classed( "inactive", false);
        }
        else {
            povertyL
                .classed( "active", true)
                .classed( "inactive", false);
            ageL
                .classed( "active", false)
                .classed( "inactive", true);
            incomeL
                .classed( "active", false)
                .classed( "inactive", true);
        }
    }
});

// y-axis labels event listener
ylabelsGroup.selectAll( "text")
    .on( "click", function() {
    // get value of selection
    var value = d3.select(this).attr( "value");
    if (value !== yLabel) {

        // Replace yLabel
        yLabel = value;
        var yArr = statesData.map( function( data) {
            return data[yLabel];
        });
      
        xLinearScale = xScale(statesData, xLabel);
        yLinearScale = yScale(statesData, yLabel);
        yAxis = renderYAxes(yLinearScale, yAxis);
        circlesXY = renderYCircles(circleLoc, yLinearScale, yLabel);
        circleLabel = renderYText(circleLabel, yLinearScale, yLabel);
        circlesGroup = updateToolTip(circlesGroup, xLabel, yLabel);
  
        plotRegress = renderRegression(statesData, plotRegress, xLinearScale, yLinearScale, xLabel, yLabel, xArr);

        var corrCoeff = pearson( xArr, yArr);
        var statsText = statsGroup
            .attr( "x", 50)
            .attr( "y", 50)
            .text( "Correlation Coefficient: " + corrCoeff.toFixed( 6))
            .attr( "fill", "black");
        
        
        if (yLabel === "smokes") {
            healthL
                .classed( "active", false)
                .classed( "inactive", true);
            smokerL
                .classed( "active", true)
                .classed( "inactive", false);
            obeseL
                .classed( "active", false)
                .classed( "inactive", true);
        }
        else if (yLabel === "obesity"){
            healthL
                .classed( "active", false)
                .classed( "inactive", true);
            smokerL
                .classed( "active", false)
                .classed( "inactive", true);
            obeseL
                .classed( "active", true)
                .classed( "inactive", false);
        }
        else {
            healthL
                .classed( "active", true)
                .classed( "inactive", false);
            smokerL
                .classed( "active", false)
                .classed( "inactive", true);
            obeseL
                .classed( "active", false)
                .classed( "inactive", true);
        }
    }
});


circlesGroup = updateToolTip( circlesGroup, xLabel, yLabel);
});