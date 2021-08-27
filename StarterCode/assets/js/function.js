function xScale(csvData, xLabel) {

    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(csvData, d => d[xLabel]) * 0.9,
            d3.max(csvData, d => d[xLabel]) * 1.1
        ])
        .range([0, chartWidth]);
        
    return xLinearScale;
}


function yScale(csvData, yLabel) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(csvData, d => d[yLabel]) - 1,
            d3.max(csvData, d => d[yLabel]) + 1
        ])
        .range([chartHeight, 0]);

        return yLinearScale;
}

function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

function renderXCircles(circlesGroup, newXScale, xLabel) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[xLabel]));

    return circlesGroup;
}

function renderYCircles(circlesGroup, newYScale, yLabel) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[yLabel]));

    return circlesGroup;
}

function renderXText(circlesGroup, newXScale, yLabel) {

    circlesGroup.transition()
        .duration(1000)
        .attr("dx", d => newXScale(d[yLabel]));

    return circlesGroup;
}

function renderYText(circlesGroup, newYScale, yLabel) {

    circlesGroup.transition()
        .duration(1000)
        .attr("dy", d => newYScale(d[yLabel])+5);

    return circlesGroup;
}


function regressionSetup(csvData, xLabel, yLabel, xArr) {
    var xArrNew = csvData.map(function(data) {
        return data[xLabel];
    });

    var linearRegression = ss.linearRegression(csvData.map(d => [d[xLabel], d[yLabel]]));
    var linearRegressionLine = ss.linearRegressionLine(linearRegression);

    function regressionPoints() {
        var firstX = d3.min(xArrNew);
        console.log(firstX);
        var lastX = d3.max(xArrNew);
        console.log(lastX);
        var xCoordinates = [firstX, lastX];
        var lineEndpoints = xCoordinates.map(d => ({
            x: d,                        
            y: linearRegressionLine(d)
        }));
        console.log(xCoordinates);
        console.log(lineEndpoints);     
        return lineEndpoints;
    };

    var linePoints = regressionPoints(xArrNew);
    return linePoints;
}  

function renderRegression(csvData, plotRegress, newXScale, newYScale, xLabel, yLabel, xArr) {
    var newLine = d3.line()
        .x(data => newXScale(data.x))
        .y(data => newYScale(data.y));
    
    var newRegressPoints = regressionSetup(csvData, xLabel, yLabel, xArr);

    plotRegress.transition()
        .duration(1000)
        .attr("d", newLine(newRegressPoints));
    
    return plotRegress;
}

var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

function updateToolTip(circlesGroup, xLabel, yLabel) {

    var xsign = "";
    var xText = "";
    if (xLabel === "poverty") {
        xText = "Poverty";
        xsign = "%";
    } else if (xLabel === "age"){
        xText = "Age";
    } else {
        xText = "Income";
    }

    var ypercentsign = "";
    var yText = "";
    if (yLabel === "healthcare") {
        yText = "Healthcare";
        ypercentsign = "%";
    } else if (yLabel === "smokes"){
        yText = "Smokes";
        ypercentsign = "%";
    } else {
        yText = "Obesity";
        ypercentsign = "%";
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([50, -75])
        .html(function(d) {
            if (xLabel === "income"){
            var incomelevel = formatter.format(d[xLabel]);
  
            return (`${d.state}<br>${xText}: ${incomelevel}<br>${yText}: ${d[yLabel]}${ypercentsign}`)
            } else {
            return (`${d.state}<br>${xText}: ${d[xLabel]}${xsign}<br>${yText}: ${d[yLabel]}${ypercentsign}`)
            };
        });

    circlesGroup.call(toolTip);
    
    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
    })

        .on("mouseout", function(data) {
            toolTip.hide(data, this);
        });

    return circlesGroup;
}

function pearson(ar1, ar2){
    function mean(array){
        let nmean = 0;
        for(var i=0; i<array.length;i++)
            nmean += array[i]
        return nmean/array.length
    }
    function dot(ar1,ar2){
        let result = 0
        if(ar1.length!=ar2.length)
            return undefined
        for(var i in ar1)
            result += ar1[i]*ar2[i]

        return result
    }
    function pseudo_bsxfun(array, number, operator){
        switch(operator){
            case '+':
                for(var i in array)
                    array[i] += number
                break
            case '-':
                for(var i in array)
                    array[i] -= number
                break
            case '*':
                for(var i in array)
                    array[i] *= number
                break
            case '/':
                for(var i in array)
                    array[i] /= number
                break


        }
        return array
    }
    function cov(ar1, ar2){
        let nmean1 = mean(ar1)
        let nmean2 = mean(ar2)
        let cov = []

        nmean1 = pseudo_bsxfun(ar1, nmean1, '-')
        nmean2 = pseudo_bsxfun(ar2, nmean2, '-')

        return dot(nmean1, nmean2)/(ar1.length-1)
    }

    function variance(array){
        let nmean = mean(array)
        let result = 0

        for(var i in array){
            result += Math.pow(array[i]-nmean, 2)
        }
        return result/(array.length-1)
    }

    return cov(ar1, ar2)/Math.sqrt( variance(ar1)*variance(ar2) )
}