let _width = $(window).width();
let _height = $(window).height();
let width = _width;
let height = _height;

let lmargin = width * 0.2, rmargin = width * 0.88;
let umargin = height * 0.1, dmargin = height * 0.9;

let show_data_file = './json/tmp.json';
let data_file = '';

let tot_show_nodes = 0, show_links = [], show_nodes = []; // 要展示的城市编号为0~tot_show_nodes-1。show_links用来存储要展示的铁路, 从show_data_file里读入，预处理阶段存进来
let cityname2id = {}, id2cityname = []; //{'重庆':0, '上海':1, ... }、['重庆', '上海', ...]
let real_position = []; //按照编号对应的经纬度，形如[ [106.549, 29.581], [121.445, 31.213], ... ]

let tot_nodes, to = [], nxt = [], head = [], weight = [], tot_edges = 0; //用来存最短路建图的点数和邻接表
let result = null; // result表示要传给图布局的结果(符合语义的最短路), 大小为tot_show_nodes*tot_show_nodes的二维数组
let loc = null; // loc为一个tot_show_nodes*2的数组，表示每个点应该在屏幕上的位置
let link, node, text; // d3用来画图的东西
let mode = 0, time, year, month; // 交互的参数

function screener() {
    // TODO 等到JSON文件造好，需要完善建边过程
    // 根据时间把最短路的图建好，存在邻接表里

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

    for(i = 0; i < tot_show_nodes; i++){
        for (j = i+1; j < tot_show_nodes; j++){
            add_edge(i, j, get_realdis(real_position[i],real_position[j]));
            add_edge(j, i, get_realdis(real_position[i],real_position[j]));
        }
    }
}

function basic_configuration(svg) {
    //这个函数涉及我们之前吹出来的三种交互、以及图布局的美工之类的东西。

    // if(mode == 0) { // 24h mode
    //
    // }
    // else
    {
        function getcolor() {
            // if (w < 5) return "#bbcdc5";
            // if (w < 10) return "#c2ccd0";
            // if (w < 20) return "#75878a";
            // if (w < 40) return "#6b6882";
            // return "#725e82";
            return "#007777";
        }
        //
        // links
        link = svg.append("g")
            // .attr("stroke", "#e4c6d0")
            .attr("stroke", "#d2691e")
            .attr("stroke-opacity", 0.3)
            .selectAll("line")
            .data(show_links)
            .join("line");
            // .attr("stroke-width", d => Math.sqrt(d.weight));

        // nodes
        node = svg.append("g")
            .attr("stroke-width", 0.5)
            .selectAll("circle")
            .data(show_nodes)
            .join("circle")
            .attr("r", 10)
            .attr("stroke", d => getcolor())
            .attr("fill", d => getcolor());
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

        text = svg.append("g")
            .selectAll("text")
            .data(show_nodes)
            .join("text")
            .text(d => id2cityname[d.id]);
    }
}

function drawer() {// 这函数也是展示图布局的一部分，之后改
    console.log(link, show_links, loc);
    link
        .attr("x1", d => loc[d.u][1])
        .attr("y1", d => loc[d.u][0])
        .attr("x2", d => loc[d.v][1])
        .attr("y2", d => loc[d.v][0]);

    node
        .attr("cx", d => loc[d.id][1])
        .attr("cy", d => loc[d.id][0]);
    text
        .attr("x", d => loc[d.id][1])
        .attr("y", d => loc[d.id][0]);
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

    screener(); // 将数据预处理，并依照参数筛掉一些铁路。根据参数，将建好的边存进links和nodes里

    basic_configuration(svg); // 基本的布局设置，依赖于数据筛选器的结果
    
    interactive_bar(); // 交互模块

    cal_shortest_path(); // 根据links和nodes里的图，计算最短路, 并将结果以二维矩阵的形式存进result里

    graph_layout_algorithm();  // 根据result, 计算返回每个点的坐标 存在某个数组里，比如loc

    drawer(); // 绘制links, nodes和text的位置
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

let data1 = null, data2 = null;
function data_prepare() {
    for(var city in data2.nodes){
        cityname2id[city] = tot_show_nodes;
        id2cityname.push(city);
        show_nodes.push({'id':tot_show_nodes});
        tot_show_nodes++;
        real_position.push(data2.nodes[city]);
    }
    for(var i=0, len=data2.links.length; i<len; i++){
        show_links.push({'u':cityname2id[data2.links[i][0]], 'v':cityname2id[data2.links[i][1]]});
    }
    tot_nodes = tot_show_nodes;
    // for(var city in data1.nodes){
    //     // 对于不需要show但出现在图中的点，往后加编号和映射关系
    // }
    result = new Array(tot_show_nodes);
    loc = new Array(tot_show_nodes);
    for(i=0; i<tot_show_nodes; i++){
        result[i] = new Array(tot_show_nodes);
    }
    // console.log(real_position, cityname2id, show_links)
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
    // d3.json(data_file).then(function (DATA) {
    //     data = DATA;
    // });
    d3.json(show_data_file).then(function (DATA) {
        data2 = DATA;
        data_prepare();
        draw_graph();
    });
}

main();