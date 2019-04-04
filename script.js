////////////////////////////////////////////////////////////
// original code: http://bl.ocks.org/Caged/6476579
////////////////////////////////////////////////////////////

var coinsPerTransaction = 1;
var initialCoins = 20;
var interval = 1;
var margin = {top: 40, right: 20, bottom: 30, left: 40};
var maxCoins = 100;
var numberOfPersons = 100;
var persons = [];
var svg;
var takeLoserCoins = false;
var timerId;
var tip;
var _width = 1500, width, height;
var x, xAxis, y, yAxis;
      

document.getElementById("load_graph").addEventListener("click", function(){
  document.getElementById("load_graph").innerText = "Refresh Graph";
  coinsPerTransaction = document.getElementById("coins_per_transaction").value || coinsPerTransaction;
  initialCoins = document.getElementById("initial_coins").value || initialCoins;
  interval = (document.getElementById("update_interval").value || interval) * 1000;
  maxCoins = document.getElementById("max_coins").value || maxCoins;
  numberOfPersons = document.getElementById("number_of_persons").value || numberOfPersons;
  _width = document.getElementById("graph_width").value || _width;
  var takeOrLeaveCoins = document.getElementsByClassName("btn btn-secondary active")[0].firstChild.nextElementSibling.id;
  takeLoserCoins = takeOrLeaveCoins == "take_coins";
  if (timerId) clearInterval(timerId);
  initGraph();
  updateGraph();
});



// -----------------------------------------------------------------------------
function initGraph() {
  for (var idx = 0; idx < numberOfPersons; idx++) {
    persons.push({
      id: idx + 1,
      coins: initialCoins
    });
  }

  var formatPercent = d3.format("");

  width = _width - margin.left - margin.right;
  height = 500 - margin.top - margin.bottom;

  x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);

  y = d3.scale.linear()
      .range([height, 0]);

  xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickFormat(formatPercent);

  tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return "<strong>Number of Persons:</strong> <span style='color:red'>" + d.frequency + "</span><br >" +
      "<strong>Coins:</strong> <span style='color:red'>" + d.letter + "</span>";
    })

  d3.select("svg").remove();
  svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.call(tip);
}

function interact(person1, person2) {
  var totalCoins = person1.coins + person2.coins;
  var randomNum = Math.floor(Math.random() * (totalCoins + 1));
  if (randomNum <= person1.coins) {
    if (coinsPerTransaction > person2.coins) {
      person1.coins += person2.coins;
      if (takeLoserCoins) person2.coins = 0;
    } else {
      person1.coins += coinsPerTransaction;
      if (takeLoserCoins) person2.coins -= coinsPerTransaction;
    }
    // TODO: display person1 as winner on page
  } else {
    if (coinsPerTransaction > person1.coins) {
      if (takeLoserCoins) person1.coins = 0;
      person2.coins += person1.coins;
    } else {
      if (takeLoserCoins) person1.coins -= coinsPerTransaction;
      person2.coins += coinsPerTransaction;
    }
    // TODO: display person2 as winner on page
  }
}

function pickRandomPerson(personToExclude = {}) {
  // do not consider persons with zero coin
  var eligiblePersons = persons.filter(p => p.coins != 0 && p.id != personToExclude.id);
  var randomNum = Math.floor(Math.random() * eligiblePersons.length);
  var person = eligiblePersons[randomNum];
  return person;
}

function plotGraph(data) {
  svg.selectAll("*").remove();

  x.domain(data.map(function(d) { return d.letter; }));
  y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Number of Persons");

  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.letter); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.frequency); })
      .attr("height", function(d) { return height - y(d.frequency); })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
}

function type(d) {
  d.frequency = +d.frequency;
  return d;
}

function updateGraph() {
  timerId = setInterval(() => {
    var data = [];
  
    // check if someone has all the coins
    var winners = persons.filter(p => p.coins == maxCoins);
    if (winners.length > 0) {
      clearInterval(timerId);
      return;
    }
  
    var person1 = pickRandomPerson();
    // TODO: display info of person1 on page
    var person2 = pickRandomPerson(person1);
    // TODO: display info of person2 on page
    interact(person1, person2);
    for (var i = 0; i <= maxCoins; i++) { // the use of '<=' instead of '<' is deliberate because 
                                            // one person can have all the coins
      data.push({
        letter: `${i}`,
        frequency: persons.filter(p => p.coins == i).length
      });
    }
    plotGraph(data);
  },
  interval);
}
