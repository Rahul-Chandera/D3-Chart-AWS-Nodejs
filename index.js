
exports.handler = function (event, context, callback) {
  
  var AWS = require('aws-sdk');
  const D3Node = require('/opt/node_modules/d3-node') // Because we have used AWS Layers for all dependancies, we have to append Layers directory path when we import any external dependancies. 
  const options = { selector: '#chart', container: '<div id="container"><div id="chart"></div></div>' } // Need to define one container to render charts
  const d3n = new D3Node(options)
  const d3 = d3n.d3
  var pdf = require('/opt/node_modules/html-pdf'); // 'html-pdf' has beed used to convert html to pdf 

  // Dummy data
  var data = [
    { value: 20, label: 'Mon' },
    { value: 25, label: 'Tues' },
    { value: 5, label: 'Wed' },
    { value: 10, label: 'Thur' },
    { value: 15, label: 'Fri' },
    { value: 18, label: 'Sat' },
    { value: 7, label: 'Sun' }
  ];

  // Define the dimensions
  var dimensions = {
    gWidth: 600,
    gHeight: 1500,
    gMargin: 40,
    gInnerWidth: 520,
    gInnerHeight: 320,
    bMargin: 10,
    radius: 200
  };


  //=====================================================================//


  // Bar Chart

  // Define the scales
  var xScale = d3.scaleLinear()
    .domain([0, data.length])
    .range([0, dimensions.gInnerWidth]);

  // Get the max value for the data. This will determine how high our y-scale is
  var maxValue = d3.max(data, function (d) { return d.value; });

  // Now define the yScale, or vertical scale
  var yScale = d3.scaleLinear()
    .domain([0, maxValue])
    .range([0, dimensions.gInnerHeight]);

  // Finally, define the yAxis scale. This is identical to the yScale except that the domain is inverted. This is because the scale is determined from top down, rather than bottom up, and the data would look upside down otherwise.
  var yAxisScale = d3.scaleLinear()
    .domain([maxValue, 0])
    .range([0, dimensions.gInnerHeight]);

  // Render the chart
  // Select the containing element and append an SVG with your defined width and height
  var chart = d3.select(d3n.document.querySelector('#chart'))
    .append('svg')
    .attr("width", dimensions.gWidth)
    .attr("height", dimensions.gHeight);

  // Render the y-axis
  var yAxis = d3.axisLeft(yAxisScale)
    // This is to make the horizontal tick lines stretch all the way across the chart
    .tickSizeInner(-dimensions.gInnerWidth)
    // This spaces the tick values slights from the axis
    .tickPadding(10);

  chart.append('g')
    .attr("class", 'axis axis-y')
    .attr("transform", 'translate(' + dimensions.gMargin + ', ' + dimensions.gMargin + ')')
    .call(yAxis);

  // Define the ticks for the xAxis
  var xTicks = []
  for (var i = 0; i < data.length; i++) {
    xTicks.push(i + 0.5); // 0.5 is to ensure the ticks are offset correctly to match the data
  }

  // Render the x-axis
  var xAxis = d3.axisBottom(xScale)
    .tickValues(xTicks)
    .tickFormat(function (d, i) {
      return data[i].label;
    });

  chart.append('g')
    .attr("class", 'axis axis-x')
    .attr("transform", 'translate(' + dimensions.gMargin + ', ' + (dimensions.gMargin + dimensions.gInnerHeight) + ')')
    .call(xAxis);

  chart.append('g')
    .selectAll('.' + 'bar-line')
    .data(data)
    .enter()
    .append('rect')
    .attr("class", 'bar-line')
    .attr("transform", 'translate(' + dimensions.gMargin + ', ' + dimensions.gMargin + ')')
    .attr("height", function (d, i) { return yScale(d.value); })
    .attr("width", (dimensions.gInnerWidth / data.length) - (dimensions.bMargin * 2))
    .attr("x", function (d, i) { return (dimensions.gInnerWidth / data.length) * i + dimensions.bMargin; })
    .attr("y", function (d, i) { return dimensions.gInnerHeight - yScale(d.value); })
    .style("fill", "steelblue")


  //=====================================================================//


  // Pie Chart

  // Add chart title
  chart.append("g")
    .attr("transform", "translate(" + (dimensions.gWidth / 2 - 60) + "," + 480 + ")")
    .append("text")
    .text("Pie Chart Sample")
    .attr("class", "title")

  // Add chart group element
  var g = chart.append("g")
    .attr("transform", "translate(" + 300 + "," + 700 + ")");

  // Init pie chart with values             
  var pie = d3.pie()
    .value(function (d) { return d.value; });

  // Create group element for each data values
  var arc = g.selectAll(".arc")
    .data(pie(data))
    .enter().append("g")
    .attr("class", "arc");

  // Init arc with inner & outer radius
  var path = d3.arc()
    .outerRadius(dimensions.radius - 10)
    .innerRadius(0);

  // Colors for individual arc             
  var color = d3.scaleOrdinal(['#4daf4a', '#377eb8', '#ff7f00', '#984ea3', '#e41a1c', '#48C9B0', '#F7DC6F']);

  // Plot color into all arcs          
  arc.append("path")
    .attr("d", path)
    .attr("fill", function (d) { return color(d.value); });

  // Init arc object to plot labels
  var label = d3.arc()
    .outerRadius(dimensions.radius)
    .innerRadius(dimensions.radius - 80);

  // Add text in every arc
  arc.append("text")
    .attr("transform", function (d) { return "translate(" + label.centroid(d) + ")"; })
    .text(function (d) { return d.value; })


  //=====================================================================//


  // Line chart

  var height = 300; // Chart height

  // The number of datapoints
  var n = 21;

  // X scale will use the index of our data
  var xScale = d3.scaleLinear()
    .domain([0, n - 1]) // input
    .range([0, dimensions.gInnerWidth]); // output

  // Y scale will use the randomly generate number 
  var yScale = d3.scaleLinear()
    .domain([0, 1]) // input 
    .range([height, 0]); // output 

  // d3's line generator
  var line = d3.line()
    .x(function (d, i) { return xScale(i); }) // set the x values for the line generator
    .y(function (d) { return yScale(d.y); }) // set the y values for the line generator 
    .curve(d3.curveMonotoneX) // apply smoothing to the line

  // An array of objects of length N. Each object has key -> value pair, the key being "y" and the value is a random number
  var dataset = d3.range(n).map(function (d) { return { "y": d3.randomUniform(1)() } })

  // Add the SVG to the page and employ #2
  var lineChart = chart.append("g")
    .attr("transform", "translate(" + 50 + "," + 1000 + ")");

  // Call the x axis in a group tag
  lineChart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

  // Call the y axis in a group tag
  lineChart.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

  // Append the path, bind the data, and call the line generator 
  lineChart.append("path")
    .datum(dataset) // 10. Binds data to the line 
    .attr("class", "line") // Assign a class for styling 
    .attr("d", line) // 11. Calls the line generator 
    .style("fill", "none")
    .style("stroke", "#ffab00");

  // Appends a circle for each datapoint 
  lineChart.selectAll(".dot")
    .data(dataset)
    .enter().append("circle") // Uses the enter().append() method
    .attr("class", "dot") // Assign a class for styling
    .attr("cx", function (d, i) { return xScale(i) })
    .attr("cy", function (d) { return yScale(d.y) })
    .attr("r", 5)
    .style("fill", "#ffab00")
    .style("stroke", "#fff")


  //=====================================================================//


  // Convert to PDF
  var htmlString = d3n.chartHTML();

  var fileName = 'myChart.pdf';
  var pdfOptions = { format: 'Letter', phantomPath: '/opt/node_modules/phantomjs_lambda/phantomjs_linux-x86_64' }; // 'html-pdf' is using phantomjs-prebuilt internally, so we manually included executable of phantomjs into Layers. You can find executable here 'https://github.com/TylerPachal/lambda-node-phantom'.

  //Create the PDF file from the HTML string
  pdf.create(htmlString, pdfOptions).toBuffer(function (err, buffer) {
    if (err) {
      console.log("There was an error generating the PDF file");
      console.log(err);
      var error = new Error("There was an error generating the PDF file");
      callback(error);
    }
    else {
      var s3 = new AWS.S3();
      var params = {
        Bucket: 'BUCKET NAME',
        Key: fileName,
        Body: buffer
      }

      s3.putObject(params, function (err, data) {
        if (err) {
          console.log("There was an error while saving the PDF to S3");
          console.log(err);
          var error = new Error("There was an error while saving the PDF to S3");
          callback(error);
        } else {
          console.log('Created PDF with data:');
          console.log(data);

          context.done(null, { result: 'Created PDF file' });
        }
      });
    }
  });
}
