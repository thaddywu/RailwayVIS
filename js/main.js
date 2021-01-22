let _width = $('#container').width();
let _height = $('#container').height();
let width = _width;
let height = _height;

let lmargin = width * 0.1, rmargin = width * 0.88;
let umargin = height * 0.1, dmargin = height * 0.95;

let show_data_file = './json/tmp.json';
let data_file = './json/schedulers.json';
let network_data_file = './json/network.json';

let tot_show_nodes = 0, show_links = [], show_nodes = []; // 要展示的城市编号为0~tot_show_nodes-1。show_links用来存储要展示的铁路, 从show_data_file里读入，预处理阶段存进来
let cityname2id = {}, id2cityname = []; //{'重庆':0, '上海':1, ... }、['重庆', '上海', ...]
let real_position = []; //按照编号对应的经纬度，形如[ [106.549, 29.581], [121.445, 31.213], ... ]

let tot_nodes, to = [], nxt = [], head = [], weight = [], tot_edges = 0; //用来存最短路建图的点数和邻接表
let result = null; // result表示要传给图布局的结果(符合语义的最短路), 大小为tot_show_nodes*tot_show_nodes的二维数组
let loc = []; // loc为一个tot_show_nodes*2的数组，表示每个点应该在屏幕上的位置
let loc_after_trans = []; // 一个tot_show_nodes*2的数组，表示每个点在zoom后应该在屏幕上的位置
let link, node, text_node, zoom, lasttrans; // d3用来画图的东西
let year, month; // 交互的参数
let tot_selected = 0, select_id = [];
let ban = [];

function comp(str, yy, mm) { // 判断str所对应的字符串是否在yy.mm之后
    let LL = str.split('.');
    if(parseInt(LL[0]) != yy) return parseInt(LL[0]) > yy;
    if(LL.length == 1 || parseInt(LL[1],[10]) <= mm) return false;
    return true;
}

function screener() {
    // 根据时间把最短路的图建好，存在邻接表里


    function belong(u, v, date1, railway){
        if(date1 != railway['date']) return false;
        for(let i=0; i<railway.route.length;i++){
            if(u==railway.route[i]) return true;
            if(v==railway.route[i]) return true;
        }
        return false;
    }

    tot_edges = 0;
    head = [];
    for(train_id in data1){
        let nn = data1[train_id].route.length;
        for(let i = 0; i < nn - 1; i++){
            if(comp(data1[train_id].date[i], year, month)) continue;
            let flag = 0;
            for(j=0;j<ban.length;j++){
                if(belong(data1[train_id].route[i].city,data1[train_id].route[i+1].city,data1[train_id].date[i],data3[ban[j]])) flag=1;
            }
            if(flag) continue;
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
    svg.append('g')
        .attr('transform', `translate(${lmargin+(rmargin-lmargin)/2}, ${umargin*0.4})`)
        .append('text')
        .attr('class', 'title')
        .text('A Visualization of Inter City Accessibility Affected by Railway Construction in China');

    function getcolor() {
        return "#ffffff";
    }

    function get_railway_info(L) {
        let content = "";
        for(i=0;i<L.length;i++){
            if(comp(L[i].date, year, month)) continue;
            content += L[i].name + ':<br/><table>' +
                '<tr><td>铁路类型:</td><td>' + L[i].service +'</td></tr>' +
                '<tr><td>电气化:</td><td>' + L[i].electrification +'</td></tr>' +
                '<tr><td>开通时间:</td><td>' + L[i].date +'</td></tr></table>'
        }
        return content;
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
                node.attr('fill', d => getcolor());
                select_id[0]=ID;
                View1(ID); return 1;
            }
        }
    }

    // links
    link = svg.append("g")
        // .attr("stroke", "#e4c6d0")
        .selectAll("line")
        .data(show_links)
        .join("line")
        .attr("stroke-width", d => 5)
        .on("mouseover", function (e, d) {// 显示tooltip
            let tooltip= d3.select('#tooltip');
            let content = get_railway_info(d.railways);
            // content = '1';
            tooltip.html(content)
                .style('position', 'absolute')
                .style("left",(lmargin+(rmargin-lmargin)*0.8)+"px")
                .style("top",(umargin)+"px")
                .style('visibility', 'visible');
        })
        .on("mouseout", function (e, d) {// 隐藏
            let tooltip= d3.select('#tooltip');
            tooltip.style('visibility', 'hidden');
        })
        .on("dblclick", function (e, d) {
            if(ban.length != 0) return;
            for(i=0;i<d.railways.length;i++){
                ban.push(d.railways[i].name);
            }
            d3.select(this).attr('display', 'none');
            screener();
            cal_shortest_path();
            view_show();
        });

    // nodes
    node = svg.append("g")
        .selectAll("circle")
        .data(show_nodes)
        .join("circle")
        .attr("r", function (d) {
            if(d.level == 1) return 10;
            else return 5;
        })
        .attr("stroke", "#000000")
        .attr("stroke-width", function (d) {
            if(d.level == 1) return 3;
            else return 2;
        })
        .attr("fill", "#ffffff")
        .attr("status", 0)
        .on("mouseover", function (e, d) {// 鼠标悬停点上，颜色变浅，显示文字
            d3.select(this)
                .attr('opacity', 0.3);
            text_node.attr('display', function (f) {
                if(f.id == d.id || f.level == 1) return "null";
                return "none";
            });
            if(select_id.length == 1) {
                let tooltip = d3.select('#tooltip');

                let content = "从 " + id2cityname[select_id[0]] +' 到 ' + id2cityname[d.id] + '<br/>需要'
                 + Math.floor(result[select_id[0]][d.id]/60) + ' 小时 ' + Math.floor(result[select_id[0]][d.id]%60) + '分钟';
                // content = '1';
                tooltip.html(content)
                    .style('position', 'absolute')
                    .style("left", (lmargin + (rmargin - lmargin) * 0.8) + "px")
                    .style("top", (umargin) + "px")
                    .style('visibility', 'visible');

                let circle = d3.select('#contour');
                circle
                    .attr('cx', loc_after_trans[select_id[0]][1])
                    .attr('cy', loc_after_trans[select_id[0]][0])
                    .attr('r', Math.sqrt((loc_after_trans[select_id[0]][0]-loc_after_trans[d.id][0])**2+(loc_after_trans[select_id[0]][1]-loc_after_trans[d.id][1])**2))
                    .attr('display', 'null')
            }
        })
        .on("mouseout", function (e, d) {// 鼠标移出颜色恢复
            d3.select(this)
                .attr('opacity', 1.0);
            text_node.attr('display', function (f) {
                if(f.level == 1) return "null";
                return "none";
            });
            let tooltip= d3.select('#tooltip');
            tooltip.style('visibility', 'hidden');
            let circle = d3.select('#contour');
            circle.attr('display', 'none');
        })
        .on("click", function (e, d) {
            let ret = click_node(d.id);
            if(ret==1) d3.select(this).attr('fill', '#990000');
            else if(ret==0) d3.select(this).attr('fill', getcolor());
        });

    text_node = svg.append("g")
        .selectAll("text")
        .data(show_nodes)
        .join("text")
        .text(d => id2cityname[d.id])
        .attr('display', function (d) {
            if(d.level == 1) return 'null';
            return 'none';
        });

}

function drawer(reset_zoom) {
    // console.log(link, show_links, loc);
    function get_link_color(d) {
        // console.log(d);
        best_service = '无';
        for(i=0;i<d.railways.length;i++) {
            if (comp(d.railways[i].date, year, month)) continue;
            if (d.railways[i].service == '高速铁路') best_service = '高速铁路';
            else if(d.railways[i].service == '快速铁路' && best_service != '高速铁路') best_service = '快速铁路';
            else if(d.railways[i].service == '普速铁路' && best_service == '无') best_service = '普速铁路';
        }
        // console.log(best_service);
        if(best_service == '普速铁路') return "#DD2222";
        if(best_service == '快速铁路') return "#E6E61A";
        if(best_service == '高速铁路') return "#11EE3D";
        return "#ffffff";
        // return "#d2691e";
    }
    if(reset_zoom) {
        d3.select('#container')
            .select('svg')
            .transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity.scale(1));
        link
            .attr("stroke", d => get_link_color(d))
            .attr("stroke-opacity", 0.6)
            .transition()
            .duration(1200)
            .attr("x1", d => loc[d.u][1])
            .attr("y1", d => loc[d.u][0])
            .attr("x2", d => loc[d.v][1])
            .attr("y2", d => loc[d.v][0]);
        node
            .transition()
            .duration(1200)
            .attr("cx", d => loc[d.id][1])
            .attr("cy", d => loc[d.id][0]);
        text_node
            .transition()
            .duration(1200)
            .attr("x", d => (loc[d.id][1] - 15))
            .attr("y", d => (loc[d.id][0] - 10));
    }
    else{
        link
            .attr("stroke", d => get_link_color(d))
            .attr("stroke-opacity", 0.6)
            .transition()
            .duration(1200)
            .attr("x1", d => loc_after_trans[d.u][1])
            .attr("y1", d => loc_after_trans[d.u][0])
            .attr("x2", d => loc_after_trans[d.v][1])
            .attr("y2", d => loc_after_trans[d.v][0]);
        node
            .transition()
            .duration(1200)
            .attr("cx", d => loc_after_trans[d.id][1])
            .attr("cy", d => loc_after_trans[d.id][0]);
        text_node
            .transition()
            .duration(1200)
            .attr("x", d => (loc_after_trans[d.id][1] - 15))
            .attr("y", d => (loc_after_trans[d.id][0] - 10));
    }

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

    // modify('text_year', 0.02, 0.15);
    // modify('year', 0.02, 0.2);
    // modify('text_month', 0.02, 0.25);
    // modify('month', 0.02, 0.3);
    // modify('align', 0.04, 0.4);
    // modify('pause', 0.12, 0.3);
    // modify('undo', 0.04, 0.5);

    timeline_functions = addDateParam('timeline', '对应月份', 1971*12+1, 2020*12+12, 1971*12+1, null);
}

function pos_after_transform(trans, pos){
    return [pos[0]*trans.k+trans.y, pos[1]*trans.k+trans.x];
}

function draw_graph() {

    zoom = d3.zoom()
        .scaleExtent([0.2, 5])
        .on("zoom", function (e, d) {
            lasttrans = e.transform;

            for(let i = 0; i < tot_show_nodes; i++){
                loc_after_trans[i] = pos_after_transform(e.transform, loc[i]);
            }

            // node.attr("transform", e.transform);
            // link.attr("transform", e.transform);

            link
                .attr("x1", d => loc_after_trans[d.u][1])
                .attr("y1", d => loc_after_trans[d.u][0])
                .attr("x2", d => loc_after_trans[d.v][1])
                .attr("y2", d => loc_after_trans[d.v][0]);

            node
                .attr("cx", d => loc_after_trans[d.id][1])
                .attr("cy", d => loc_after_trans[d.id][0]);

            text_node
                .attr("x", d => (loc_after_trans[d.id][1]-15))
                .attr("y", d => (loc_after_trans[d.id][0]-10));
        });


    let svg = d3.select('#container')
        .select('svg')
        .attr('width', width)
        .attr('height', height)
        .call(zoom);

    interactive_bar(); // 交互模块

    screener(); // 将数据预处理，并依照参数筛掉一些铁路。根据参数，将建好的边存进links和nodes里

    basic_configuration(svg); // 基本的布局设置，依赖于数据筛选器的结果

    cal_shortest_path(); // 根据links和nodes里的图，计算最短路, 并将结果以二维矩阵的形式存进result里

    graph_layout_algorithm();  // 根据result, 计算返回每个点的坐标 存在某个数组里，比如loc

    align_with_screen(); // 绘制links, nodes和text的位置，并align

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

let data1 = null, data2 = null, data3 = null;
function data_prepare() {
    for(let city in data2.nodes){
        cityname2id[city] = tot_show_nodes;
        id2cityname.push(city);
        show_nodes.push({'id':tot_show_nodes, 'level': data2.nodes[city][2]});
        tot_show_nodes++;
        real_position.push([data2.nodes[city][0], data2.nodes[city][1]]);
    }
    for(let i=0, len=data2.links.length; i<len; i++){
        show_links.push({'u':cityname2id[data2.links[i].u], 'v':cityname2id[data2.links[i].v], 'railways': data2.links[i].railways});
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


    // year = document.getElementById('year').value;
    // month = document.getElementById('month').value;
}

// function update() {
//     year = document.getElementById('year').value;
//     document.getElementById('text_year').textContent = 'year: ' + year;
//     month = document.getElementById('month').value;
//     document.getElementById('text_month').textContent = 'month: ' + month;
//
//     screener();
//     cal_shortest_path();
//     view_show();
// }

function update_month_year(){
    // year = document.getElementById('year').value;
    // month = document.getElementById('month').value;
    // if(year<2020) year++;
    // else pause();
    // document.getElementById('month').value = month;
    // document.getElementById('year').value = year;
    // document.getElementById('text_year').textContent = 'year: ' + year;
    // document.getElementById('text_month').textContent = 'month: ' + month;
    let v_old = timeline_functions['getv']();
    let v_new = v_old+12;
    if(v_new >= 2020*12+12) {v_new = 2020*12+12;pause();}
    timeline_functions['setv'](v_new);
}

function pause() {
    if(intv){
        document.getElementById('pause').src = 'icon/play.jpg';
        clearInterval(intv);
        intv=undefined;
    }
    else{
        document.getElementById('pause').src = 'icon/pause.jpg';
        intv = setInterval(() => {
            update_month_year();
            screener();
            cal_shortest_path();
            view_show();
        }, 1000);
    }
}

function undo() {
    ban = [];
    link.attr('display', 'block');
    screener();
    cal_shortest_path();
    view_show();
}

function main() {
    set_ui();
    d3.json(data_file).then(function (DATA) {
        data1 = DATA;
        d3.json(show_data_file).then(function (DATA) {
            data2 = DATA;
            d3.json(network_data_file).then(function (DATA) {
                data3 = DATA;
                data_prepare();
                draw_graph();
                intv = setInterval(() => {
                    update_month_year();
                    screener();
                    cal_shortest_path();
                    view_show();
                }, 1000);
            });
        });
    });

}

main();