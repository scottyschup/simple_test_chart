$(function () {
  function formatData (data, extent) {
    extent = extent || [];
    if (!extent[0]) { extent[0] = -Infinity; }
    if (!extent[1]) { extent[1] = Infinity; }
    var filteredData = {};

    function limitRange (datum) {
      if (typeof datum.x !== Number) { datum.x = Number(datum.x); }
      return datum.x > Number(extent[0]) && datum.x < Number(extent[1]);
    }
    for (var series in data) {
      filteredData[series] = data[series].filter(limitRange);
    }

    return [
      {
        values: filteredData.series1,
        key: 'Series 1',
        color: '#ff7f0e'
      },
      {
        values: filteredData.series2,
        key: 'Series 2',
        color: '#2ca02c'
      },
      {
        values: filteredData.series3,
        key: 'Series 3',
        color: '#0088ee'
      }
    ];
  }

  function dateTimeFormat (d) {
    if (typeof d !== Date) {
      d = new Date(d);
    }
    var date = [],
    time = [];
    date.push(d.getMonth() + 1);
    date.push(d.getDate());
    date.push(d.getYear() - 100);
    time.push(d.getHours());
    time.push(d.getMinutes());
    time.push(d.getSeconds());
    return date.join('/') + ' ' + time.join(':');
  }

  function random (seed) {
    if (seed === 0 || seed % Math.PI === 0) {
      seed ++;
    } else if (seed === undefined) {
      seed = 1;
    }
    var x = Math.sin(seed) * 10000;

    return x - Math.floor(x);
  }

  function generateRawData () {
    var rawData = { "series1": [], "series2": [], "series3": [] };
    var time = Date.now() - 604800000;

    for (var i = 1; i <= 1000; i += 2) {
      time += (random(i) * 1200000);
      var dateTime = new Date(time);
      // var thisRand = Math.abs(0.5 - Math.log(random(i + 2)));
      var thisRand = random(i + 2) / 1.4 + 0.3;
      rawData.series1.push({ x: dateTime, y: 15 * i * thisRand });
      rawData.series2.push({ x: dateTime, y: Math.pow(1.01, i) * thisRand });
      rawData.series3.push({ x: dateTime, y: 30000 / Math.sqrt(i) * thisRand });
    }

    return rawData;
  }

  nv.addGraph(function () {
    function resetChart (ev) {
      console.log('rightclick', ev);
      d3.selectAll(".brush").call(d3.svg.brush().clear())
    }

    function onBrushEnd() {
      var rectExtent = d3.selectAll('rect.extent')
      // rectExtent.classed("inactive", true);
      var brushExtent = d3.event.target.extent();
      console.log(brushExtent);
      if (brushExtent[0] !== brushExtent[1]) {
        var brushC = d3.select('#chart svg g');
        redrawChart(brushExtent);
      }
    }

    function onBrushStart () {
      var rectExtent = d3.selectAll('rect.extent')
      rectExtent.classed("inactive", false);
    }

    function redrawChart(extent) {
      if (extent === undefined) { var extent = [-Infinity, Infinity]}
      chart.xAxis
      .axisLabel('Date')
      .tickFormat(dateTimeFormat);

      d3.select('#chart svg')
      .datum(formatData(generateRawData(), extent))
      .transition().duration(500)
      .call(chart);

      nv.utils.windowResize(chart.update);
    }

    var chart = nv.models.lineChart()
    .useInteractiveGuideline(true);

    chart.xAxis
    .axisLabel('Date')
    .tickFormat(dateTimeFormat);

    chart.yAxis
    .axisLabel('Math')
    .tickFormat(d3.format('.02f'));


    d3.select('#chart svg')
      .on('mousewheel', resetChart)
      .datum(formatData(generateRawData()))
      .transition().duration(500)
      .call(chart);

    // var xMin = Number(rawData.series1[0].x);
    // var xMax = Number(rawData.series1[rawData.series1.length - 1].x);
    // var xScale = d3.time.scale()
    //   .domain([xMin, xMax])
    //   .range([0, window.screen.width * 0.9]);
    //
    // var selection = d3.svg.brush()
    //   .x(xScale)
    //   .on('brush', function () {
    //     xScale.domain(selection.extent());
    //     redrawChart(selection.extent(), chart);
    //     console.log(selection.extent());
    //   });
    //
    // d3.select('#chart svg')
    //   .append("g")
    //   .attr("class", "selection")
    //   .call(selection)
    //   .selectAll("rect")
    //   .attr("height", "100%");

    var brushC = d3.select('#chart svg g');
    brushC.empty() ? brushC.append('g') : brushC.select('g')
      .attr('class', 'brush')
      .call(d3.svg.brush()
        .x(chart.xAxis.scale())
        .on('brushstart', onBrushStart)
        .on('brushend', onBrushEnd)
        .extent([0, 0])
      )
      .selectAll('rect')
      .attr('height', '99%');

    nv.utils.windowResize(chart.update);

    return chart;
  });

});
