// ! Defining width and height of SVG container
const width = 1400;
const height = 700;

// ! Create SVG Element
const heatMap = d3
  .select("body")
  .append("svg")
  .attr("height", height)
  .attr("width", width)
  .attr("id", "heatMap")
  .style("background-color", "white")
  .style("margin-top", "10px")
  .style("margin", "auto")
  .style("box-shadow", "2px 1px 20px 6px #000000");

// ! Rendering the chart using the function
const renderHeatMap = (data) => {
  // prettier-ignore
  const monthNames = ["January","February","March","April",
  "May","June","July","August","September","October","November","December"];
  const baseTemp = +data.baseTemperature;
  data = data.monthlyVariance;
  // ! Margin convention
  margin = { top: 100, right: 140, bottom: 90, left: 110 };
  const innerWidth = width - margin.right - margin.left;
  const innerHeight = height - margin.top - margin.bottom;

  // ! Setting the domain and scale of x and y axis

  const xScale = d3
    .scaleBand()
    .range([0, innerWidth])
    .domain(
      d3.map(data, function (d) {
        return d.year;
      })
    );

  const yScale = d3
    .scaleBand()
    .range([0, innerHeight])
    .domain(
      d3.map(data, function (d) {
        return d.month;
      })
    );

  // ! Introducing subgroup "g"
  const gheatMap = heatMap
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // ! Creating the chart
  // ! Defining the steps and colors for heatmap
  var steps = 11;
  const start = d3.min(data, (d) => baseTemp + d.variance);
  const end = d3.max(data, (d) => baseTemp + d.variance);
  const interval = (end - start) / steps;
  const array_with_steps = Array(steps)
    .fill()
    .map((_, i) => [start + i * interval]);
  var colorPallette = d3
    .scaleThreshold()
    .domain(array_with_steps)
    .range(d3.schemeSpectral[steps].reverse());
  // ! Defining tooltip
  var tooltipForData = d3
    .select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);
  gheatMap
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("x", function (d) {
      return xScale(d.year);
    })
    .attr("y", function (d) {
      return yScale(d.month);
    })
    .attr("width", xScale.bandwidth())
    .attr("height", yScale.bandwidth())
    .style("fill", function (d) {
      return colorPallette(baseTemp + d.variance);
    })
    .attr("data-month", (d) => monthNames.indexOf(d.month))
    .attr("data-year", (d) => d.year)
    .attr("data-temp", (d) => baseTemp + d.variance)
    .on("mouseover", function (event, d) {
      tooltipForData.transition().duration(100).style("opacity", 1);
      const newLocal = "#tooltip";
      tooltipForData
        .html(
          d.year +
            " - " +
            d.month +
            "<br>" +
            "Average: " +
            parseFloat(baseTemp + d.variance).toFixed(2) +
            "℃" +
            "<br>" +
            "Variance: " +
            `${
              d.variance > 0
                ? "+" + d.variance.toFixed(2)
                : d.variance.toFixed(2)
            }` +
            "℃"
        )
        .style("left", parseFloat(d3.select(this).attr("x")) + 80 + "px")
        .style("top", d3.select(this).attr("y") + "px")

        .attr("data-year", d.year);
    })

    .on("mouseout", function (d) {
      tooltipForData.transition().duration(100).style("opacity", 0);
    });

  // ! Introducing x axis
  const xAxisG = gheatMap
    .append("g")
    .call(
      d3
        .axisBottom(xScale)
        .tickValues(
          xScale.domain().filter(function (d, i) {
            return !(d % 10);
          })
        )
        .tickSizeOuter(0)
    )
    .attr("class", "forColoring")
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${innerHeight})`);

  // ! Introducing y axis
  const yAxisG = gheatMap
    .append("g")
    .attr("class", "forColoring")
    .attr("id", "y-axis")
    .call(d3.axisLeft(yScale).tickSizeOuter(0));
  // ! Introducing axis labels and title of chart
  xAxisG
    .append("text")
    .attr("class", "xAxisLabel")
    .text("Years")
    .attr("x", innerWidth / 2)
    .attr("y", 45);
  yAxisG
    .append("text")
    .attr("class", "yAxisLabel")
    .text("Months")
    .attr("x", -innerHeight / 2)
    .attr("y", -70)
    .style("transform", "rotate(-90deg)");
  gheatMap
    .append("text")
    .text("Monthly Global Land-Surface Temperature")
    .attr("id", "title")
    .attr("x", innerWidth / 2)
    .attr("y", -50);
  gheatMap
    .append("text")
    .text("1753 - 2015: base temperature is 8.66℃")
    .attr("id", "description")
    .attr("x", innerWidth / 2)
    .attr("y", -20);

  // ! Creating the legend
  heatMap
    .append("g")
    .attr("class", "legendSequential")
    .attr("transform", `translate(${width - 130}, ${innerHeight / 2})`);
  const legendLabelFormat = (number) =>
    d3.format(".2f")(number).replace("NaN", "0");
  var legendSequential = d3
    .legendColor()
    .shapeWidth(40)
    .shapeHeight(20)
    .shapePadding(0)
    .labelFormat(d3.format(".2f"))
    .labels(d3.legendHelpers.thresholdLabels)
    .orient("vertical")
    .scale(colorPallette);

  heatMap
    .select(".legendSequential")
    .call(legendSequential)
    .attr("id", "legend");

  // ! Adding source
  const divSource = d3
    .select("svg")
    .append("g")
    .attr("transform", `translate(${width - margin.right}, ${height - 30})`);
  divSource
    .append("text")
    .attr("class", "textSource")
    .text("Data source: ")
    .append("a")
    .attr("class", "linkSource")
    .attr(
      "href",
      "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
    )
    .attr("target", "_blank")
    .text("https://raw.githubusercontent.com/freeCodeCamp...");

  // ! Adding author
  const author = d3
    .select("body")
    .append("h1")
    .attr("class", "nameAuthor")
    .text("Created by ")
    .append("a")
    .attr("href", "https://www.linkedin.com/in/davor-jovanovi%C4%87/")
    .attr("target", "_blank")
    .text("DavorJ");
};

// ! Getting the data
d3.json(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
).then((data) => {
  // prettier-ignore
  const monthNames = ["January","February","March","April",
  "May","June","July","August","September","October","November","December"];
  data.monthlyVariance.forEach((d) => {
    var parseTime = d3.timeFormat("%Y");
    d.month = monthNames[d.month - 1];
    // d.year = +d.year;
    d.year = parseTime(new Date(d.year, 0));
    d.variance = +d.variance;
  });
  renderHeatMap(data);
});
