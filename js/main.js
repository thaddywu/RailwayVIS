let _width = $(window).width();
let _height = $(window).height();
let width = _width;
let height = _height;

let lmargin = width * 0.2, rmargin = width * 0.88;
let umargin = height * 0.1, dmargin = height * 0.9;

let show_data_file = './json/tmp.json';
let data_file = './json/schedulers.json';

let tot_show_nodes = 0, show_links = [], show_nodes = []; // 要展示的城市编号为0~tot_show_nodes-1。show_links用来存储要展示的铁路, 从show_data_file里读入，预处理阶段存进来
let cityname2id = {}, id2cityname = []; //{'重庆':0, '上海':1, ... }、['重庆', '上海', ...]
let real_position = []; //按照编号对应的经纬度，形如[ [106.549, 29.581], [121.445, 31.213], ... ]

let tot_nodes, to = [], nxt = [], head = [], weight = [], tot_edges = 0; //用来存最短路建图的点数和邻接表
let result = null; // result表示要传给图布局的结果(符合语义的最短路), 大小为tot_show_nodes*tot_show_nodes的二维数组
let loc = null; // loc为一个tot_show_nodes*2的数组，表示每个点应该在屏幕上的位置
let link, node, text; // d3用来画图的东西
let mode = 0, time, year, month; // 交互的参数
let tot_selected = 0, select_id = [];

function screener() {
    // 根据时间把最短路的图建好，存在邻接表里

    function comp(str, yy, mm) {
        let LL = str.split('.');
        // console.log(LL, yy, mm, parseInt(LL[0]) > yy);
        if(parseInt(LL[0]) != yy) return parseInt(LL[0]) > yy;
        if(LL.length == 1 || parseInt(LL[1],[10]) <= mm) return false;
        return true;
    }

    tot_edges = 0;
    head = [];
    for(train_id in data1){
        let nn = data1[train_id].route.length;
        for(let i = 0; i < nn - 1; i++){
            if(comp(data1[train_id].date[i], year, month)) continue;
            let t1 = data1[train_id].route[i].departure;
            t1 = parseInt(t1.split(":")[0], [10])*60+parseInt(t1.split(":")[1], [10]);
            let t2 = data1[train_id].route[i+1].arrival;
            t2 = parseInt(t2.split(":")[0], [10])*60+parseInt(t2.split(":")[1], [10]);
            add_edge(cityname2id[data1[train_id].route[i].city], cityname2id[data1[train_id].route[i+1].city], t2-t1);
        }
    }

    // //直接根据地理位置建边，仅用于test
    // for(i = 0; i < tot_show_nodes; i++){
    //     for (j = i+1; j < tot_show_nodes; j++){
    //         add_edge(i, j, get_realdis(real_position[i],real_position[j]));
    //         add_edge(j, i, get_realdis(real_position[i],real_position[j]));
    //     }
    // }
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

        function click_node(ID){
            if(tot_selected == 0){
                tot_selected++; select_id.push(ID);
                View1(ID); return 1;
            }
            else if(tot_selected == 1){
                if(select_id[0] == ID){
                    tot_selected--; select_id.pop();
                    Recovery(); return 0;
                }
                else{
                    tot_selected++; select_id.push(ID);
                    View2(select_id[0], ID); return 1;
                }
            }
            else{
                if(select_id[0] == ID){
                    let tmp = select_id[0];
                    select_id[0] = select_id[1];
                    select_id[1] = tmp;
                }
                if(select_id[1] == ID){
                    select_id.pop(); tot_selected--;
                    View1(select_id[0]); return 0;
                }
            }
            return 2;
        }

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
            .attr("fill", d => getcolor())
            .attr("status", 0)
            .on("mouseover", function (e, d) {// 鼠标悬停颜色变浅
                d3.select(this)
                    .attr('opacity', 0.3);
            })
            .on("mouseout", function (e, d) {// 鼠标移出颜色恢复
                d3.select(this)
                    .attr('opacity', 1.0);
            })
            .on("click", function (e, d) {
                let ret = click_node(d.id);
                if(ret==1) d3.select(this).attr('fill', '#990000');
                else if(ret==0) d3.select(this).attr('fill', getcolor());
            });

        text = svg.append("g")
            .selectAll("text")
            .data(show_nodes)
            .join("text")
            .text(d => id2cityname[d.id]);
    }
}

function drawer() {
    // console.log(link, show_links, loc);
    link
        .transition()
        .duration(1500)
        .attr("x1", d => loc[d.u][1])
        .attr("y1", d => loc[d.u][0])
        .attr("x2", d => loc[d.v][1])
        .attr("y2", d => loc[d.v][0]);

    node
        .transition()
        .duration(1500)
        .attr("cx", d => loc[d.id][1])
        .attr("cy", d => loc[d.id][0]);
    text
        .transition()
        .duration(1500)
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

    modify('text_year', 0.02, 0.15);
    modify('year', 0.02, 0.2);
    modify('text_month', 0.02, 0.25);
    modify('month', 0.02, 0.3);
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
    for(let city in data2.nodes){
        cityname2id[city] = tot_show_nodes;
        id2cityname.push(city);
        show_nodes.push({'id':tot_show_nodes});
        tot_show_nodes++;
        real_position.push(data2.nodes[city]);
    }
    for(let i=0, len=data2.links.length; i<len; i++){
        show_links.push({'u':cityname2id[data2.links[i][0]], 'v':cityname2id[data2.links[i][1]]});
        //show_links.push({'v':cityname2id[data2.links[i][0]], 'u':cityname2id[data2.links[i][1]]});
    }
    tot_nodes = tot_show_nodes;
    for(let train_id in data1){
        let nn = data1[train_id].route.length;
        for(let i = 0; i < nn; i++){
            let city = data1[train_id].route[i].city;
            if(!(city in cityname2id)){
                cityname2id[city] = tot_nodes;
                id2cityname.push(city);
                tot_nodes++;
            }
        }
    }
    result = new Array(tot_show_nodes);
    loc = new Array(tot_show_nodes);
    for(i=0; i<tot_show_nodes; i++){
        result[i] = new Array(tot_show_nodes);
    }
}

function update(mode_change) {
    year = document.getElementById('year').value;
    document.getElementById('text_year').textContent = 'year: ' + year;
    month = document.getElementById('month').value;
    document.getElementById('text_month').textContent = 'month: ' + month;

    // screener();
    // cal_shortest_path();
    // View1(select_id[0]);

    screener();
    cal_shortest_path();
    Recovery();
}

function main() {
    set_ui();
    d3.json(data_file).then(function (DATA) {
        data1 = DATA;
        d3.json(show_data_file).then(function (DATA) {
            data2 = DATA;
            data_prepare();
            draw_graph();
        });
    });

}

main();