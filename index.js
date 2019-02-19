
exports.handler = function (event, context, callback) {

  var AWS = require('aws-sdk');
  const D3Node = require('/opt/node_modules/d3-node') // Because we have used AWS Layers for all dependancies, we have to append Layers directory path when we import any external dependancies. 
  const options = { selector: '#chart', container: '<div id="container"><div id="chart"></div></div>' } // Need to define one container to render charts
  const d3n = new D3Node(options)
  const d3 = d3n.d3
  var pdf = require('/opt/node_modules/html-pdf'); // 'html-pdf' has beed used to convert html to pdf 

  // Dummy data
  var data = [
    { value: 99, label: 'Mon' },
    { value: 63, label: 'Tues' },
    { value: 41, label: 'Wed' },
    { value: 100, label: 'Thur' },
    { value: 50, label: 'Fri' },
    { value: 23, label: 'Sat' },
    { value: 8, label: 'Sun' }
  ];

  // Define the dimensions
  var dimensions = {
    gWidth: 600,
    gHeight: 400,
    gMargin: 40,
    gInnerWidth: 520,
    gInnerHeight: 320,
    bMargin: 10
  };

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
    .style("fill", "#E67E22")
    .attr("transform", 'translate(' + dimensions.gMargin + ', ' + dimensions.gMargin + ')')
    .attr("height", function (d, i) { return yScale(d.value); })
    .attr("width", (dimensions.gInnerWidth / data.length) - (dimensions.bMargin * 2))
    .attr("x", function (d, i) { return (dimensions.gInnerWidth / data.length) * i + dimensions.bMargin; })
    .attr("y", function (d, i) { return dimensions.gInnerHeight - yScale(d.value); })

  // Convert to PDF
  var htmlString = d3n.chartHTML();
  var fileName = 'myChart.pdf';
  var pdfOptions = { format: 'Letter', phantomPath: '/opt/node_modules/phantomjs_lambda/phantomjs_linux-x86_64' }; // 'html-pdf' is using phantomjs internally, and there is no direct npm lib availalble for it, so I manually include executable of phantomjs.

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
        Bucket: '{BUCKET NAME}',
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