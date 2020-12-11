let _width = $(window).width();
let _height = $(window).height();
let width = _width;
let height = _height;

let lmargin = width * 0.2, rmargin = width * 0.88;
let umargin = height * 0.1, dmargin = height * 0.9;

let data = null;
let data_file = './json/stations.json';

let highlight_nodes = [], highlight_links = []; // 用来存储要展示的点和铁路，可直接在这里打或者通过文件读入
let links = [], nodes = [], result = []; //用来存最短路建图的点集和边集、result表示要传给图布局的结果(符合语义的最短路)
let link, node, text; // d3用来画图的东西
let mode = 0, time, year, month; // 交互的参数

// 下面这段是上次力导向用的，也不知道最后用不用的上
// let nodes_dict = {}, nodes2num = {}, thresh_node = 0, thresh_link = 0, n, iteration = 300, spring_len = 5;
// let attr_coef = 0.1, rep_coef = 0.05;
//
// function graph_layout_algorithm(nodes, links) {
//
//     polygon(nodes, links);
//     final_algorithm(nodes, links, iteration, spring_len, attr_coef, rep_coef);
//     normalize(nodes, links);
//
//
// }

function screener() {
    // 等到JSON格式确定，这里用来预处理JSON文件，顺便根据mode把最短路的图建好，存在nodes和links里

    // nodes = data.nodes.filter((d, i) => (d.weight >= thresh_node));
    // n = nodes.length;
    // nodes_dict = {};
    // nodes2num = {};
    //
    // nodes.forEach((d, i) => (nodes_dict[d.id] = d));
    // nodes.forEach((d, i) => (nodes2num[d.id] = i));
    //
    // function checker(x) {
    //     return nodes_dict.hasOwnProperty(x);
    // }
    //
    // links = data.links.filter((d, i) => (d.weight >= thresh_link && checker(d.source) && checker(d.target)));
}

function basic_configuration(svg) {
    //这个函数涉及我们之前吹出来的三种交互、以及图布局的美工之类的东西，详细的可以放在最后写，demo给个最基本的就行。

    if(mode == 0) { // 24h mode
        // function getcolor(w) {
        //     if (w < 5) return "#bbcdc5";
        //     if (w < 10) return "#c2ccd0";
        //     if (w < 20) return "#75878a";
        //     if (w < 40) return "#6b6882";
        //     return "#725e82";
        // }
        //
        // // links
        // link = svg.append("g")
        //     .attr("stroke", "#e4c6d0")
        //     //.attr("stroke", "#d2691e")
        //     .attr("stroke-opacity", 0.3)
        //     .selectAll("line")
        //     .data(links)
        //     .join("line")
        //     .attr("stroke-width", d => Math.sqrt(d.weight));
        //
        // // nodes
        // node = svg.append("g")
        //     .attr("stroke-width", 0.5)
        //     .selectAll("circle")
        //     .data(nodes)
        //     .join("circle")
        //     .attr("r", d => Math.sqrt(d.weight) * 2 + 0.5)
        //     .attr("stroke", d => getcolor(d.weight))
        //     .attr("fill", d => getcolor(d.weight))
        //     .attr("status", 0)
        //     .on("mouseover", function (e, d) {// 鼠标移动到node上时显示text
        //         text
        //             .attr("display", function (f) {
        //                 if (f.id == d.id || f.weight > 40) {
        //                     return "null";
        //                 } else {
        //                     return "none";
        //                 }
        //             })
        //     })
        //     .on("mouseout", function (e, d) {// 鼠标移出node后按条件判断是否显示text
        //         text
        //             .attr("display", function (f) {
        //                 if (f.weight > 40) {
        //                     return 'null';
        //                 } else {
        //                     return 'none';
        //                 }
        //             })
        //     })
        //     .on("dblclick", function (e, d) {
        //         link.attr("stroke-opacity", function (f) {
        //             if (f.source == d.id || f.target == d.id) {
        //                 return 1.0;
        //             } else {
        //                 return 0.1;
        //             }
        //         });
        //         node.attr("opacity", function (f) {
        //             console.log(ShortestPath[nodes2num[f.id]][nodes2num[d.id]], nodes2num[f.id], nodes2num[d.id]);
        //             if (ShortestPath[nodes2num[f.id]][nodes2num[d.id]] == 1 || f.id == d.id) {
        //                 return 1.0;
        //             } else {
        //                 return 0.1;
        //             }
        //         });
        //     })
        //     .on("click", function (e, d) {
        //         link.attr("stroke-opacity", function (f) {
        //             return 0.3;
        //         });
        //         node.attr("opacity", function (f) {
        //             return 1.0;
        //         });
        //     });
        //
        // // 学校名称text，只显示满足条件的学校
        // text = svg.append("g")
        //     .selectAll("text")
        //     .data(nodes)
        //     .join("text")
        //     .text(d => d.id)
        //     .attr("display", function (d) {
        //         if (d.weight > 40) {
        //             return 'null';
        //         } else {
        //             return 'none';
        //         }
        //     });
    }
    else{

    }
}

function drawer() {// 这函数也是展示图布局的一部分，之后改
    // link
    //     .attr("x1", d => nodes_dict[d.source].x)
    //     .attr("y1", d => nodes_dict[d.source].y)
    //     .attr("x2", d => nodes_dict[d.target].x)
    //     .attr("y2", d => nodes_dict[d.target].y);
    //
    // node
    //     .attr("cx", d => d.x)
    //     .attr("cy", d => d.y);
    // text
    //     .attr("x", d => d.x)
    //     .attr("y", d => d.y)
}

function interactive_bar() {
    function modify(name, _left, _top) {
        txt = document.getElementById(name);
        txt.style.position = 'absolute';
        txt.style.left = _left * _width + 'px';
        txt.style.top = _top * _height + 'px';
    }
    function show(name) {
        txt = document.getElementById(name);
        txt.style.display = "block";
    }
    function hide(name) {
        txt = document.getElementById(name);
        txt.style.display = "none";
    }

    modify('text_mode', 0.02, 0.1);
    modify('switch_mode', 0.06, 0.1);
    if(mode == 0) {
        modify('text_time', 0.02, 0.15);
        modify('departure_time_hour', 0.02, 0.2);
        modify('departure_time_minute', 0.02, 0.25);
        show("text_time");show("departure_time_hour");show("departure_time_minute");
        hide("text_year");hide("year");hide("text_month");hide("month");
    }
    else{
        modify('text_year', 0.02, 0.15);
        modify('year', 0.02, 0.2);
        modify('text_month', 0.02, 0.25);
        modify('month', 0.02, 0.3);
        hide("text_time");hide("departure_time_hour");hide("departure_time_minute");
        show("text_year");show("year");show("text_month");show("month");
    }
}

function draw_graph() {
    let svg = d3.select('#container')
        .select('svg')
        .attr('width', width)
        .attr('height', height);

    //将数据预处理，并依照参数筛掉一些铁路(可以通过在外面预处理JSON优化，之后再说)
    screener();

    // 基本的布局设置，依赖于数据筛选器的结果
    basic_configuration(svg);
    
    interactive_bar(); // 交互模块

    //cal_shortest_path(); // 计算最短路

    // 图布局算法
    //graph_layout_algorithm(nodes, links);

    // 绘制links, nodes和text的位置
    //drawer();
}

function set_ui() {
    // 设置字体
    let ua = navigator.userAgent.toLowerCase();
    fontFamily = "Khand-Regular";
    if (/\(i[^;]+;( U;)? CPU.+Mac OS X/gi.test(ua)) {
        fontFamily = "PingFangSC-Regular";
    }
    d3.select("body")
        .style("font-family", fontFamily);
}

function update(mode_change) {
    if(mode_change){
        mode ^= 1;
        let last_mode = document.getElementById('text_mode').textContent;
        if(last_mode.endsWith("24h")) {
            document.getElementById('text_mode').textContent = 'Mode: years';
        }
        else {
            document.getElementById('text_mode').textContent = 'Mode: 24h';
        }
    }
    year = document.getElementById('year').value;
    document.getElementById('text_year').textContent = 'year: ' + year;
    month = document.getElementById('month').value;
    document.getElementById('text_month').textContent = 'month: ' + month;
    let hour = document.getElementById('departure_time_hour').value;
    let minute = document.getElementById('departure_time_minute').value;
    time = hour*60+minute;

    d3.selectAll("svg > *").remove();
    draw_graph();
}

function main() {
    set_ui();
    d3.json(data_file).then(function (DATA) {
        data = DATA;
        draw_graph();
    });
}

main()