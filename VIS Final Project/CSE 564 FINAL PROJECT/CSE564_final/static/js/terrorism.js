$(document).ready(function () {
  // Plotting of bit coin data
load_data("countAttacks");
function load_data(vartext) {
  $('#graph').html("");
  $(".terrorgroups").hide();
    //  $('#sheetrows').empty();
  console.log(vartext);
  $.ajax({
     url: '/getdata',
     data: {"dataplot" : vartext},
     type: 'POST',
     dataType: 'json',
     success: function(response) {
      console.log(jQuery.parseJSON(response.data_columns));
      $testdata = jQuery.parseJSON(response.data_columns);
       $('#graph').html("");
       $('#Legend_graph').html("");
       var margin = {
          top: 10,
          right: 0,
          bottom: 10,
          left: 0
        };
        var width = 1250 - margin.left - margin.right;
        var height = 400 - margin.top - margin.bottom;
        var radius = Math.min(width, height) / 2;
        if(vartext == 'Targettype') {
           $("h3.targets").text("Favourite Targets");
           document.getElementById("crossfilter").style.display = "none";

           console.log(Object.keys($testdata[0]));
           var jsonobj = [];
           var groupBy = {};
           $.each($testdata, function () {
               groupBy[this[vartext]] = 1 + (groupBy[this[vartext]] || 0);
           });
           jsonobj.push(groupBy);
           var fixedData = jsonobj.map(function(d){
             return d3.entries(d);
           });
           var tots = d3.sum(fixedData[0], function(d) {
               return d.value;
           });
           fixedData[0].forEach(function(d) {
               d.percentage = (d.value  / tots) * 100;
           });
           var arc = d3.arc()
             .outerRadius(radius - 10)
             .innerRadius(0);

           var labelArc = d3.arc()
             .outerRadius(radius - 40)
             .innerRadius(radius - 40);

           var pie = d3.pie()
             .sort(null)
             .value(function (d) {
                return d.value;
           });

           var tooltip = d3.select("#graph")
              .append('div')
              .attr('class', 'tooltip');

           tooltip.append('div')
              .attr('class', 'label');

           tooltip.append('div')
              .attr('class', 'count');

           var svg = d3.select("#graph").append("svg")
              .attr("width", width)
              .attr("height", height)
              .attr("class", "favourite-targets")
              .append("g")
              .attr("transform", "translate(" + width / 2.3 + ",200)");

           var g = svg.selectAll(".arc")
              .data(pie(fixedData[0]))
              .enter().append("g")
              .attr("class", "arc");

           var color = d3.scaleOrdinal(d3.schemeCategory10);

           var path = g.append("path")
             .attr("d", arc)
             .attr("fill", function(d, i){return color(i);})
             .each(function (d) {
               this._current = d;
           });

            path.on('mouseover', function (d) {
              tooltip.select('.count').html(d.data.key.toUpperCase() + " : " + d.data.percentage.toFixed(0) + "%").style('color', 'black');
              tooltip.style('display', 'block');
              tooltip.style('opacity', 2);
            });

            path.on('mousemove', function (d) {
              tooltip.style('top', (d3.event.layerY + 10) + 'px')
                .style('left', (d3.event.layerX - 25) + 'px');
            });

            path.on('mouseout', function () {
              tooltip.style('display', 'none');
              tooltip.style('opacity', 0);
            });

            let legend = d3.select("#graph").append('div')
            			.attr('class', 'legend');

            let keys = legend.selectAll('.key')
            			.data(fixedData[0])
            			.enter().append('div')
            			.attr('class', 'key')
            			.style('display', 'flex')
            			.style('align-items', 'center')
            			.style('margin-right', '20px');

            		keys.append('div')
            			.attr('class', 'symbol')
            			.style('height', '10px')
            			.style('width', '10px')
            			.style('margin', '5px 5px')
            			.style('background-color', function (d) {
                    //console.log(d.data.key);
                  return color(d.key); });

            		keys.append('div')
            			.attr('class', 'name')
            			.text(d => `${d.key} (${d.value})`);

            		keys.exit().remove();
        }
        else if(vartext == 'AttackType') {
            $("h3.targets").text("Popular Attacking Methods");
            document.getElementById("crossfilter").style.display = "none";

            var svg = d3.select("#graph").append("svg")
                .attr("width", width)
                .attr("height", height+100)
                .attr("class", "favourite-targets")
                .append("g")
                .attr("transform", "translate(" + width / 2.5 + ",50)");
            var grouparray = [];
            $.each($testdata, function(k, v) {
                grouparray.push($testdata[k].Attack_Type);
            });
            grouparray = _.uniq(grouparray);
            final_response_array = [];
            item = {};
            $.map($testdata, function (el, idx) {
                 var attcktype = el.Attack_Type;
                 if (item['Region'] != el.Region) {
                    item = {};
                 }
                 item[attcktype] = el.Count;
                 item['Region'] = el.Region;
                 final_response_array.push(item);
            });
            final_response_array = _.uniq(final_response_array);
            console.log(final_response_array);
            function createChartLegend(mainDiv, group) {
                 var z = d3.scaleOrdinal(d3.schemeCategory10);
                 var mainDivName = mainDiv.substr(1, mainDiv.length);
                 $(mainDiv).before("<div id='Legend_" + mainDivName + "' class='pmd-card-body' style='margin-top:0; margin-bottom:0; margin-left: 15%;'></div>");
                 var keys = group;
                 keys.forEach(function(d) {
                     var cloloCode = z(d);
                     $("#Legend_" + mainDivName).append("<span class='team-graph team1' style='display: inline-block; margin-right:10px;'>\
               			<span style='background:" + cloloCode +
                         ";width: 10px;height: 10px;display: inline-block;vertical-align: middle;'>&nbsp;</span>\
               			<span style='padding-top: 0;font-family:Source Sans Pro, sans-serif;font-size: 13px;display: inline;'>" + d +
                         " </span>\
               		</span>");
                 });
             }
            var group = grouparray;
            var mainDiv = "#graph";
            var mainDivName = "graph";
            createChartLegend(mainDiv, group)
            var layers = d3.stack()
                .keys(group)
                .offset(d3.stackOffsetDiverging)
                (final_response_array);
                var x = d3.scaleLinear()
                .rangeRound([margin.left, width - margin.right]);

            x.domain([d3.min(layers, stackMin), d3.max(layers, stackMax)]);

            var y = d3.scaleBand()
                .rangeRound([height - margin.bottom, margin.top])
                .padding(0.1);

            y.domain(final_response_array.map(function(d) {
                return d.Region;
            }))
            function stackMin(layers) {
                 return d3.min(layers, function(d) {
                     return d[0];
                 });
            }
            function stackMax(layers) {
                 return d3.max(layers, function(d) {
                     return d[1];
                 });
            }
            var z = d3.scaleOrdinal(d3.schemeCategory10);
            var maing = svg.append("g")
                         .selectAll("g")
                         .data(layers);
            var g = maing.enter().append("g")
                  .attr("fill", function(d) {
                      return z(d.key);
            });

            var rect = g.selectAll("rect")
                .data(function(d) {
                    d.forEach(function(d1) {
                        d1.key = d.key;
                        return d1;
                    });
                    return d;
            })
            .enter().append("rect")
            .attr("data", function(d) {
             var data = {};
             if(d.data[d.key]) {
               data["key"] = d.key;
               data["value"] = d.data[d.key];
             } if(data) {
               return JSON.stringify(data);
             }
            })
            .attr("width", function(d) {
                return x(d[1]) - x(d[0]);
            })
            .attr("x", function(d) {
                return x(d[0]);
            })
            .attr("y", function(d) {
                return y(d.data.Region);
            })
            .attr("height", y.bandwidth);

            rect.on("mouseover", function() {
                  var currentEl = d3.select(this);
                  var fadeInSpeed = 120;
                  d3.select("#recttooltip_" + mainDivName)
                      .transition()
                      .duration(fadeInSpeed)
                      .style("opacity", function() {
                          return 1;
                      });
                  d3.select("#recttooltip_" + mainDivName).attr("transform", function(d) {
                      var mouseCoords = d3.mouse(this.parentNode);
                      var xCo = 0;
                      if (mouseCoords[0] + 10 >= width * 0.80) {
                          xCo = mouseCoords[0] - parseFloat(d3.selectAll("#recttooltipRect_" + mainDivName)
                              .attr("width"));
                      } else {
                          xCo = mouseCoords[0] + 10;
                      }
                      var x = xCo;
                      var yCo = 0;
                      if (mouseCoords[0] + 10 >= width * 0.80) {
                          yCo = mouseCoords[1] + 10;
                      } else {
                          yCo = mouseCoords[1];
                      }
                      var x = xCo;
                      var y = yCo;
                      return "translate(" + x + "," + y + ")";
                  });
                  //CBT:calculate tooltips text
                  var tooltipData = JSON.parse(currentEl.attr("data"));
                  var tooltipsText = "";
                  d3.selectAll("#recttooltipText_" + mainDivName).text("");
                  var yPos = 0;
                  d3.selectAll("#recttooltipText_" + mainDivName).append("tspan").attr("x", 0).attr("y", yPos * 10).attr("dy", "1.9em").text(tooltipData.key + ":  " + tooltipData.value);
                  //CBT:calculate width of the text based on characters
                  var dims = helpers.getDimensions("recttooltipText_" + mainDivName);
                  d3.selectAll("#recttooltipText_" + mainDivName + " tspan")
                      .attr("x", dims.w + 4);
                  d3.selectAll("#recttooltipRect_" + mainDivName)
                      .attr("width", dims.w + 10)
                      .attr("height", dims.h + 20);
            });

            rect.on("mousemove", function() {
                var currentEl = d3.select(this);
                currentEl.attr("r", 7);
                d3.selectAll("#recttooltip_" + mainDivName)
                    .attr("transform", function(d) {
                        var mouseCoords = d3.mouse(this.parentNode);
                        var xCo = 0;
                        if (mouseCoords[0] + 10 >= width * 0.80) {
                            xCo = mouseCoords[0] - parseFloat(d3.selectAll("#recttooltipRect_" + mainDivName)
                                .attr("width"));
                        } else {
                            xCo = mouseCoords[0] + 10;
                        }
                        var x = xCo;
                        var yCo = 0;
                        if (mouseCoords[0] + 10 >= width * 0.80) {
                            yCo = mouseCoords[1] + 10;
                        } else {
                            yCo = mouseCoords[1];
                        }
                        var x = xCo;
                        var y = yCo;
                        return "translate(" + x + "," + y + ")";
                    });
            });

            rect.on("mouseout", function() {
                var currentEl = d3.select(this);
                d3.select("#recttooltip_" + mainDivName)
                    .style("opacity", function() {
                        return 0;
                    })
                    .attr("transform", function(d, i) {
                        // klutzy, but it accounts for tooltip padding which could push it onscreen
                        var x = -500;
                        var y = -500;
                        return "translate(" + x + "," + y + ")";
                    });
            });

            svg.append("g")
                .attr("transform", "translate(0," + (height - margin.bottom) + ")")
                .call(d3.axisBottom(x))
                .append("text")
                .attr("x", width / 2)
                .attr("y", margin.bottom * 0.5)
                .attr("dx", "0.32em")
                .attr("fill", "#000")
                .attr("font-weight", "bold")
                .attr("text-anchor", "start")
                .text("");

            var ele = svg.append("g")
                .attr("transform", "translate(" + margin.left + ",0)")
                .call(d3.axisLeft(y));
            ele.selectAll("text")
                .attr("transform", "rotate(0)")
                .attr("dx", "-.2em")
                .attr("dy", "0.2em");
            ele.append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", 0 - (height / 2))
                .attr("y", 15 - (margin.left))
                .attr("dy", "0.32em")
                .attr("fill", "#000")
                .attr("font-weight", "bold")
                .attr("text-anchor", "middle")
                .text("");

            var rectTooltipg = svg.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 10)
                .attr("text-anchor", "end")
                .attr("id", "recttooltip_" + mainDivName)
                .attr("style", "opacity:0")
                .attr("transform", "translate(-500,-500)");

            rectTooltipg.append("rect")
                .attr("id", "recttooltipRect_" + mainDivName)
                .attr("x", 0)
                .attr("width", 120)
                .attr("height", 80)
                .attr("opacity", 0.71)
                .style("fill", "#000000");

            rectTooltipg
                .append("text")
                .attr("id", "recttooltipText_" + mainDivName)
                .attr("x", 30)
                .attr("y", 15)
                .attr("fill", function() {
                    return "#fff"
                })
                .style("font-size", function(d) {
                    return 10;
                })
                .style("font-family", function(d) {
                    return "arial";
                })
                .text(function(d, i) {
                    return "";
                });
            var helpers = {
                getDimensions: function(id) {
                    var el = document.getElementById(id);
                    var w = 0,
                        h = 0;
                    if (el) {
                        var dimensions = el.getBBox();
                        w = dimensions.width;
                        h = dimensions.height;
                    } else {
                        console.log("error: getDimensions() " + id + " not found.");
                    }
                    return {
                        w: w,
                        h: h
                    };
                }
            };
        }
        else if(vartext == 'Country') {
            $("h3.targets").text("Success Of Attacks");
            document.getElementById("crossfilter").style.display = "none";

            var svg = d3.select("#graph").append("svg")
             .attr("width", width + 150 )
             .attr("height", height + 200)
             .attr("class", "favourite-targets")
             .append("g")
             .attr("transform", "translate(" + width / 8 + ",0)");
             console.log($testdata);
             var axisTicks = {qty: 5, outerSize: 0, dateFormat: '%m-%d'};
             var xScale0 = d3.scaleBand().range([0, width]).padding(0.2)
             var xScale1 = d3.scaleBand()
             var yScale = d3.scaleLinear().range([height, 0])

             var xAxis = d3.axisBottom(xScale0).tickSizeOuter(axisTicks.outerSize);
             var yAxis = d3.axisLeft(yScale).ticks(axisTicks.qty).tickSizeOuter(axisTicks.outerSize);
             xScale0.domain($testdata.map(d => d.country_name))
             xScale1.domain(['Attacks', 'Killed']).range([0, xScale0.bandwidth()])
             yScale.domain([0, d3.max($testdata, d => d.Attacks > d.Killed ? d.Attacks : d.Killed)])

             var ele = svg.append("g")
                 .attr("transform", "translate(0," + height + ")")
                 .call(xAxis);
             ele.selectAll("text")
                 .attr("transform", "rotate(-90)")
                 .attr("dx", "-6.5em")
                 .attr("dy", "0em");
             svg.append("g")
                 .attr("class", "y axis")
                 .call(yAxis)
                 .append("text")
                 .attr("transform", "rotate(-90)")
                 .attr("y", 6)
                 .attr("dy", ".71em")
                 .style("text-anchor", "end")
                 .style('font-weight','bold')
                 .text("Value");

             svg.select('.y').transition().duration(500).delay(1300).style('opacity','1');

             var model_name = svg.selectAll(".model_name")
               .data($testdata)
               .enter().append("g")
               .attr("class", "model_name")
               .attr("transform", d => `translate(${xScale0(d.country_name)},0)`);
               /* Add field1 bars */
               model_name.selectAll(".bar.field1")
                 .data(d => [d])
                 .enter()
                 .append("rect")
                 .attr("class", "bar field1")
                 .style("fill","#4B0082")
                 .attr("x", d => xScale1('Attacks'))
                 .attr("y", d => yScale(d.Attacks))
                 .attr("width", xScale1.bandwidth())
                 .attr("height", d => {
                   return height - yScale(d.Attacks)
                 });

               /* Add field2 bars */
               model_name.selectAll(".bar.field2")
                 .data(d => [d])
                 .enter()
                 .append("rect")
                 .attr("class", "bar field2")
               .style("fill","#DA70D6")
                 .attr("x", d => xScale1('Killed'))
                 .attr("y", d => yScale(d.Killed))
                 .attr("width", xScale1.bandwidth())
                 .attr("height", d => {
                   return height - yScale(d.Killed)
                 });
                 //Legend
                 var color = d3.scaleOrdinal()
                     .range(["#4B0082","#DA70D6"]);

                 var legend = d3.select("#graph").append('div')
                       .attr('class', 'legenddiv');

                 let keys = legend.selectAll('.val')
                       .data(['Attacks', 'Killed'])
                       .enter().append('div')
                       .attr('class', 'val')
                       .style('display', 'flex')
                       .style('align-items', 'center')
                       .style('margin-right', '20px');

                     keys.append('div')
                       .attr('class', 'symbol')
                       .style('height', '10px')
                       .style('width', '10px')
                       .style('margin', '5px 5px')
                       .style('background-color', function (d) {
                         //console.log(d.data.key);
                       return color(d); });

                     keys.append('div')
                       .attr('class', 'name')
                        .text(function(d) {return d; });

                     keys.exit().remove();
                     legend.transition().duration(500).delay(function(d,i){ return 1300 + 100 * i; }).style("opacity","1");

         }
        else if(vartext == 'Trend') {
            $("h3.targets").text("Trend in Terrorist Activities");
            document.getElementById("crossfilter").style.display = "none";

            var svg = d3.select("#graph").append("svg")
                .attr("width", width+200)
                .attr("height", height+70)
                .attr("class", "favourite-targets");
            var parseTime = d3.timeParse("%Y");

            g = svg.append("g")
                .attr("transform", "translate(" + width / 10 + ",20)");
            var grouparray = [];
            $.each($testdata, function(k, v) {
                grouparray.push($testdata[k].Region);
            });
            grouparray = _.uniq(grouparray);
            final_response_array = [];
            item = {};

            $.map($testdata, function (el, idx) {
                 var attcktype = el.Region;
                 if (item['Year'] != el.Year) {
                    item = {};
                 }
                 item[attcktype] = el.Count;
                 item['Year'] = el.Year;
                 final_response_array.push(item);
            });
            var output = [];

            final_response_array.forEach(function(item) {
              var existing = output.filter(function(v, i) {
                return v.Year == item.Year;
              });
              if (existing.length) {
                var existingIndex = output.indexOf(existing[0]);
                output[existingIndex] = $.extend( output[existingIndex], item);
              } else {
                output.push(item);
              }
            });

            var finalopt = grouparray.map(function(id) {
                return {
                  country: id,
                  values: output.map(function(d) {
                   if(d[id]) {
                     return {Year: parseTime(d.Year), Count: d[id]};
                   }
                   else {
                     return {Year: parseTime(d.Year), Count: 0};
                   }
                  })
                };
            });

            // D3 Line generator with curveBasis being the interpolator
            var x = d3.scaleTime().range([0, width]),
                y = d3.scaleLinear().range([height, 0]),
                z = d3.scaleOrdinal(d3.schemeCategory10);

            var line = d3.line()
                .curve(d3.curveBasis)
                .x(function(d) { return x(d.Year); })
                .y(function(d) { return y(d.Count); });

            x.domain(d3.extent(output, function(d) { return parseTime(d.Year); }));

            y.domain([
              d3.min(finalopt, function(c) { return d3.min(c.values, function(d) { return d.Count; }); }),
              d3.max(finalopt, function(c) { return d3.max(c.values, function(d) { return d.Count; }); })
            ]);

            z.domain(finalopt.map(function(c) { return c.country; }));

            // Create X Axis
            g.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));

            // Create Y Axis
            // Add Text label to Y axis
            g.append("g")
                .attr("class", "axis axis--y")
                .call(d3.axisLeft(y))
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .attr("fill", "#000")
                .text("Count of Attacks");

            // Create a <g> element for each city
            // Note that 3 1st level arrays, so we get 3 g's
            var city = g.selectAll(".city")
              .data(finalopt)
              .enter().append("g")
                .attr("class", "city");

            // Create a <path> element inside of each city <g>
            // Use line generator function to convert 366 data points into SVG path string
            city.append("path")
                .attr("class", "line")
                .attr("d", function(d) { return line(d.values); })
                .style("stroke", function(d) { return z(d.country); });

            var color = d3.scaleOrdinal(d3.schemeCategory10);
            var legend = d3.select("#graph").append('div')
                  .attr('class', 'legendtime');

            let keys = legend.selectAll('.timeval')
                  .data(grouparray)
                  .enter().append('div')
                  .attr('class', 'timeval')
                  .style('display', 'flex')
                  .style('align-items', 'center');

                keys.append('div')
                  .attr('class', 'symbol')
                  .style('height', '10px')
                  .style('width', '10px')
                  .style('margin', '5px 5px')
                  .style('background-color', function (d) {
                    //console.log(d.data.key);
                  return color(d); });

                keys.append('div')
                  .attr('class', 'name')
                  .text(function(d) {return d; });

                keys.exit().remove();
        } else if(vartext == "hfi") {
          $("h3.targets").text("Human Freedom Index");
          document.getElementById("crossfilter").style.display = "none";
          var min_max = response.min_max
          var hfi_data = $testdata
          ////////////////////////started code for box Plot
          var groupCounts = {};
           var globalCounts = [];
           var meanGenerator = d3.randomUniform(10);
           for(i=0; i<7; i++) {
             var randomMean = meanGenerator();
             var generator = d3.randomNormal(randomMean);
             var key = i.toString();
             groupCounts[key] = [];

             for(j=0; j<100; j++) {
               var entry = generator();
               groupCounts[key].push(entry);
               globalCounts.push(entry);
             }
           }

           // Setup a color scale for filling each box
           var colorScale = d3.scaleOrdinal(d3.schemeCategory20)
             .domain(Object.keys(groupCounts));

           var i = 0;
           var myBoxPlotData = [];
           for (var [key, groupCount] of Object.entries(hfi_data)) {

             var record = {};
             var values = Object.values(groupCount);
             var noZeroes = values.filter(function(d) { return d !== 0; }); //to avoid added 0 values
             var localMin = d3.min(noZeroes);
             var localMax = d3.max(noZeroes);

             record["key"] = key;
             record["counts"] = values;
             record["quartile"] = boxQuartiles(noZeroes);
             record["whiskers"] = [localMin, localMax];
             record["color"] = colorScale(i);
             i = i+1;

             myBoxPlotData.push(record);
           }

           var xScale = d3.scalePoint()
             .domain(Object.keys(hfi_data))
             .rangeRound([0, width])
             .padding([0.5]);

           // Compute a global y scale based on the global counts
           var min = min_max[0]
           var max = min_max[1]
           var yScale = d3.scaleLinear()
             .domain([min, max])
             .range([0, height]);

           // Setup the svg and group we will draw the box plot in

           var width = 1200;
           var height = 500;
           var barWidth = 30;

           var margin = {top: 20, right: 10, bottom: 20, left: 10};

           var width = width - margin.left - margin.right,
               height = height - margin.top - margin.bottom;

           var totalWidth = width + margin.left + margin.right;
           var totalheight = height + margin.top + margin.bottom;

           var svg = d3.select("#graph")
             .append("svg")
             .attr("width", totalWidth + 200)
             .attr("height", totalheight + 100)
             .append("g")
             .attr("transform", "translate(60,200)");

           // Move the left axis over 25 pixels, and the top axis over 35 pixels
           var axisG = svg.append("g").attr("transform", "translate(25,0)");
           var axisTopG = svg.append("g").attr("transform", "translate(35,0)");

           // Setup the group the box plot elements will render in
           var g = svg.append("g")
             .attr("transform", "translate(20,5)");

           // Draw the box plot vertical lines
           var verticalLines = g.selectAll(".verticalLines")
             .data(myBoxPlotData)
             .enter()
             .append("line")
             .attr("x1", function(datum) {
                 return xScale(datum.key) + barWidth/2;
               }
             )
             .attr("y1", function(datum) {
                 var whisker = datum.whiskers[0];
                 return yScale(whisker);
               }
             )
             .attr("x2", function(datum) {
                 return xScale(datum.key) + barWidth/2;
               }
             )
             .attr("y2", function(datum) {
                 var whisker = datum.whiskers[1];
                 return yScale(whisker);
               }
             )
             .attr("stroke", "#000")
             .attr("stroke-width", 1)
             .attr("fill", "none");

           // Draw the boxes of the box plot, filled in white and on top of vertical lines
           var rects = g.selectAll("rect")
             .data(myBoxPlotData)
             .enter()
             .append("rect")
             .attr("width", barWidth)
             .attr("height", function(datum) {
                 var quartiles = datum.quartile;
                 var height = yScale(quartiles[2]) - yScale(quartiles[0]);
                 return height;
               }
             )
             .attr("x", function(datum) {
                 return xScale(datum.key);
               }
             )
             .attr("y", function(datum) {
                 return yScale(datum.quartile[0]);
               }
             )
             .attr("fill", function(datum) {
               return datum.color;
               }
             )
             .attr("stroke", "#000")
             .attr("stroke-width", 1);

           // Now render all the horizontal lines at once - the whiskers and the median
           var horizontalLineConfigs = [
             // Top whisker
             {
               x1: function(datum) { return xScale(datum.key) },
               y1: function(datum) { return yScale(datum.whiskers[0]) },
               x2: function(datum) { return xScale(datum.key) + barWidth },
               y2: function(datum) { return yScale(datum.whiskers[0]) }
             },
             // Median line
             {
               x1: function(datum) { return xScale(datum.key) },
               y1: function(datum) { return yScale(datum.quartile[1]) },
               x2: function(datum) { return xScale(datum.key) + barWidth },
               y2: function(datum) { return yScale(datum.quartile[1]) }
             },
             // Bottom whisker
             {
               x1: function(datum) { return xScale(datum.key) },
               y1: function(datum) { return yScale(datum.whiskers[1]) },
               x2: function(datum) { return xScale(datum.key) + barWidth },
               y2: function(datum) { return yScale(datum.whiskers[1]) }
             }
           ];

           for(var i=0; i < horizontalLineConfigs.length; i++) {
             var lineConfig = horizontalLineConfigs[i];

             // Draw the whiskers at the min for this series
             var horizontalLine = g.selectAll(".whiskers")
               .data(myBoxPlotData)
               .enter()
               .append("line")
               .attr("x1", lineConfig.x1)
               .attr("y1", lineConfig.y1)
               .attr("x2", lineConfig.x2)
               .attr("y2", lineConfig.y2)
               .attr("stroke", "#000")
               .attr("stroke-width", 1)
               .attr("fill", "none");
           }

           // Setup a scale on the left
           var axisLeft = d3.axisLeft(yScale);
           axisG.append("g")
             //.attr("transform", "translate(0," + height + ")")
             .call(axisLeft);

           // Setup a series axis on the top
           var axisTop = d3.axisTop(xScale);
           var ele = axisTopG.append("g")
             .call(axisTop);

             ele.selectAll("text")
                 .attr("transform", "rotate(-90)")
                 .attr("dx", "8em")
                 .attr("dy", "0.9em");


           ///////if wrong remove till here

           function boxQuartiles(d) {
             return [
               d3.quantile(d, .25),
               d3.quantile(d, .5),
               d3.quantile(d, .75)
             ];
           }



           // Perform a numeric sort on an array
           function sortNumber(a,b) {
             return a - b;
           }

          /////end code for boxplot
        }
        else if(vartext == 'countAttacks') {
            $("h3.targets").text("Number of Attacks per country");
            $('#crossfilter').css({'style':'display: none'})
            document.getElementById("crossfilter").style.display = "none";
            ///////////////// start of map code //////////////////

            var format = d3.format(",");

          // Set tooltips
            var tip = d3.tip()
                      .attr('class', 'd3-tip')
                      .offset([-10, 0])
                      .html(function(d) {
                        return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Count: </strong><span class='details'>" + format(d.countAttacks) +"</span>";
                      })

          var width = 1200 - margin.left - margin.right,
                          height = 400 - margin.top - margin.bottom;

          var margin = {top: 0, right: 0, bottom: 0, left: 0},
                      width = 960 - margin.left - margin.right,
                      height = 500 - margin.top - margin.bottom;

          var color = d3.scaleThreshold()
              .domain([1,5,10,30,50,100,200,500,1000,20000])
              .range(["rgb(169, 174, 178)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)","rgb(33,113,181)","rgb(8,81,156)","rgb(8,48,107)","rgb(3,19,43)"]);

          var path = d3.geoPath();

          var svg = d3.select("#graph")
                      .append("svg")
                      .attr("width", width + 200)
                      .attr("height", height + 100)
                      .append('g')
                      .attr('class', 'map')
                      .attr("transform", "translate(220,50)");

          var projection = d3.geoMercator()
                             .scale(130)
                            .translate( [width / 2, height / 1.5]);

          var path = d3.geoPath().projection(projection);

          svg.call(tip);

          var world_data = response.data_world
          count_terrorist = $testdata
          console.log(count_terrorist);
          console.log("count terror above")

          // ready(world_data, data_pop)
          ready2(world_data, count_terrorist)

          function ready2(data, count_terrorist) {
            var countAttacksByName = {};
            console.log(data)
            console.log(count_terrorist);
            Array.from(count_terrorist).forEach(function(d) {
              countAttacksByName[d.name] = +d.count;
             });

             //Array.from(population).forEach(function(d) {
             //     populationById[d.name] = +d.population;
             //    });

            console.log("countAttacksByName")
            data.features.forEach(function(d) {
              // d.countAttacks = countAttacksByName[d.properties.name]
              // if(d.properties.name=='Greenland') {
              //   console.log(countAttacksByName[d.properties.name])
              // }
              if(countAttacksByName[d.properties.name] === undefined) {
                d.countAttacks = 0
                countAttacksByName[d.properties.name] = 0
              } else {
              d.countAttacks = countAttacksByName[d.properties.name]
            }
            });
            console.log(data.features)


            svg.append("g")
                .attr("class", "countries")
              .selectAll("path")
                .data(data.features)
              .enter().append("path")
                .attr("d", path)
                .style("fill", function(d) { return color(countAttacksByName[d.properties.name]); })
                .style('stroke', 'white')
                .style('stroke-width', 1.5)
                .style("opacity",0.8)
                // tooltips
                  .style("stroke","white")
                  .style('stroke-width', 0.3)
                  .on('mouseover',function(d){
                    tip.show(d);

                    d3.select(this)
                      .style("opacity", 1)
                      .style("stroke","white")
                      .style("stroke-width",3);
                  })
                  .on('mouseout', function(d){
                    tip.hide(d);

                    d3.select(this)
                      .style("opacity", 0.8)
                      .style("stroke","white")
                      .style("stroke-width",0.3);
                  });

            svg.append("path")
                .datum(topojson.mesh(data.features, function(a, b) { return a.id !== b.id; }))
                 // .datum(topojson.mesh(data.features, function(a, b) { return a !== b; }))
                .attr("class", "names")
                .attr("d", path);
          }


            ///////////////// end of map code //////////////////
          }
          else if(vartext == 'prediction') {
            document.getElementById("crossfilter").style.display = "none";
            $("h3.targets").text("Predicting casualities");

            predictionList = response.predictionList
            console.log("prediction")
            console.log(predictionList)

            var x = d3.scaleBand().range([0, width]).padding(0.2);
            var y = d3.scaleLinear().range([height, 0]);
            var svg = d3.select("#graph").append("svg")
            .attr("width", width - margin.left - margin.right + 100)
            .attr("height", height + 130)
            .append("g")
            .attr("transform",
                  "translate(130," + margin.top + ")");

            x.domain(predictionList.map(function(d) { return d[0]; }));
            y.domain([0, d3.max(predictionList, function(d) { return d[1]; })]);

              svg.append("g")
                .call(d3.axisBottom(x))
                .attr("transform", "translate(0," + height + ")")
              .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", "-.55em")
                .attr("transform", "rotate(-90)" );

            svg.append("g")
            .call(d3.axisLeft(y).tickFormat(function(d) {
                return d;
              })
              .ticks(5))
              .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Value ($)");

            svg.selectAll("bar")
                .data(predictionList)
                .enter().append("rect")
                .style("fill", "#E27E7E")
                .attr("x", function(d) { return x(d[0]); })
                .attr("width", x.bandwidth())
                .attr("y", function(d) { return y(d[1]); })
                .attr("height", function(d) { return height - y(d[1]); });
            }
            else if(vartext == 'dashboard') {
              $("h3.targets").text("Year Wise Analysis");
              document.getElementById("crossfilter").style.display = "block";


              var attackData = $testdata
              var dropdownTestData = JSON.parse(response.test_data)
              console.log(dropdownTestData);

              var select = d3.select("div")
                .append("select").attr('id','country').attr('class', 'sheetrows');

              document.getElementById('country').value="Algeria";
              select
                .on("change", function(d) {
                  var value = d3.select(this).property("value");
                  display();
                });

              select.selectAll("option")
                .data(dropdownTestData)
                .enter()
                  .append("option")
                  .attr("value", function (d) { return d.value; })
                  .text(function (d) { return d.label; }).style("float","right")
                  .on("change", function(d) {
                    var value = d3.select(this).property("value");
                    display();
                  });

                  document.getElementById('country').value="India";
                  document.getElementById('dropdown').value="attacktype1";

              display();
              function display(){
                  console.log("display called")
                    var menu=document.getElementById('dropdown').value;
                    var country=document.getElementById('country').value;
                    var textMenu = "Number of people killed"
                    if(menu == 'targettype1') {
                      textMenu = "Target type"
                    } else if(menu == 'attacktype1'){
                      textMenu = "Attack type"
                    } else {
                      textMenu = "Number of people killed"
                    }

                    console.log(country)
                    console.log(menu)
                    var attackData = $testdata
                    console.log(attackData);
                    var dropdownTestData = JSON.parse(response.test_data)
                    console.log(dropdownTestData);

                    d3.select('svg').remove();
                    var svg = d3.select("#graph").append('svg').attr('height',500).attr('width',700).attr("transform", "translate(400,0)");
                    var margin = {top: 40, right: 20, bottom: 110, left: 40},
                        margin2 = {top: 430, right: 20, bottom: 30, left: 40},
                        width = +svg.attr("width") - margin.left - margin.right,
                        height = +svg.attr("height") - margin.top - margin.bottom,
                        height2 = +svg.attr("height") - margin2.top - margin2.bottom;

                    var x = d3.scaleTime().range([0, width]),
                        x2 = d3.scaleTime().range([0, width]),
                        y = d3.scaleLinear().range([height, 0]),
                        y2 = d3.scaleLinear().range([height2, 0]);


                        svg.append("text")
                           .attr("transform", "translate(-100,-50)")
                           .attr("x", 200)
                           .attr("y", 70)
                           .attr("font-size", "20px")
                           .text(textMenu + " as per year")


                    var xAxis = d3.axisBottom(x).tickFormat(function(d,i){
                      return "";
                    }),
                        xAxis2 = d3.axisBottom(x).tickFormat(function(d,i){
                          return parseInt(2*1000+8+i);
                        }),
                        yAxis = d3.axisLeft(y);

                    var brush = d3.brushX()
                        .extent([[0, 0], [width, height2]])
                        .on("brush end", brushed);

                    var zoom = d3.zoom()
                        .scaleExtent([1, Infinity])
                        .translateExtent([[0, 0], [width, height]])
                        .extent([[0, 0], [width, height]])
                        .on("zoom", zoomed);

                    var area = d3.area()
                        .curve(d3.curveMonotoneX)
                        .x(function(d) { return x(d.Year); })
                        .y0(height)
                        .y1(function(d) { return y(d[menu]); });

                    var area2 = d3.area()
                        .curve(d3.curveMonotoneX)
                        .x(function(d) { return x2(d.Year); })
                        .y0(height2)
                        .y1(function(d) { return y2(d[menu]); });

                    svg.append("defs").append("clipPath")
                        .attr("id", "clip")
                      .append("rect")
                        .attr("width", width)
                        .attr("height", height);

                    var focus = svg.append("g")
                        .attr("class", "focus")
                        .attr("transform", "translate(40,40)");

                    var context = svg.append("g")
                        .attr("class", "context")
                        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

                    var attackData = attackData.filter(function(d) {
                      return d["Country"] === country;
                    })

                    console.log(attackData);

                      x.domain(d3.extent(attackData, function(d) {
                        return d.Year; }));
                      y.domain([0, d3.max(attackData, function(d) { return d[menu]; })]);
                      x2.domain(x.domain());
                      y2.domain(y.domain());


                      focus.append("path")
                          .datum(attackData)
                          .attr("class", "area")
                          .attr("d", area);

                      focus.append("g")
                          .attr("class", "axis axis--x")
                          .attr("transform", "translate(0," + height + ")")
                          .call(xAxis)
                          .append("text")
                             .attr("y", height - 330)
                             .attr("x", width - 200)
                             .attr("text-anchor", "end")
                             .attr("stroke", "black")
                             .text("<------Year------->");



                      focus.append("g")
                          .attr("class", "axis axis--y")
                          .call(yAxis)
                          .append("text")
                             .attr("transform", "rotate(-90)")
                             .attr("y", -30)
                             .attr("x", -100)
                             .attr("text-anchor", "end")
                             .attr("stroke", "black")
                             .text(textMenu);


                      context.append("path")
                          .datum(attackData)
                          .attr("class", "area")
                          .attr("d", area2);

                      context.append("g")
                          .attr("class", "axis axis--x")
                          .attr("transform", "translate(0," + height2 + ")")
                          .call(xAxis2);

                      context.append("g")
                          .attr("class", "brush")
                          .call(brush)
                          .call(brush.move, x.range());

                      svg.append("rect")
                          .attr("class", "zoom")
                          .attr("width", width)
                          .attr("height", height)
                          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                          .call(zoom);

                    //// till here terror end


                    function brushed() {
                      if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
                      var s = d3.event.selection || x2.range();
                      x.domain(s.map(x2.invert, x2));
                      focus.select(".area").attr("d", area);
                      focus.select(".axis--x").call(xAxis);
                      svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
                          .scale(width / (s[1] - s[0]))
                          .translate(-s[0], 0));
                    }

                    function zoomed() {
                      if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
                      var t = d3.event.transform;
                      x.domain(t.rescaleX(x2).domain());
                      focus.select(".area").attr("d", area);
                      focus.select(".axis--x").call(xAxis);
                      context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
                    }
              }


            } /// crossfilter end

     },
     error: function(error) {
        console.log(error);
     }
   });
  }
  $("#sheetrows").on('change', function () {
    if($(this).val() == 'groups') {
        $('#graph').html("");
        $('#Legend_graph').html("");
        $("h3.targets").text("Terrorist Groups With Highest Terror Attack");
        $(".terrorgroups").show();
    }
    else {
         load_data($(this).val());
    }
    if($(this).val() != 'dashboard') {
          document.getElementById("country").style.display = "none";
    }
  });
});
