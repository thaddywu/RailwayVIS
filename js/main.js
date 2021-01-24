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
let link, node, text_node, zoom, lasttrans={'k':1,'x':0,'y':0}; // d3用来画图的东西
let year, month; // 交互的参数
let tot_selected = 0, select_id = [];
let ban = [];

function set_ui() {
    // 设置字体
    let ua = navigator.userAgent.toLowerCase();
    fontFamily = "Khand-Regular";
    if (/\(i[^;]+;( U;)? CPU.+Mac OS X/gi.test(ua)) {
        fontFamily = "PingFangSC-Regular";
    }
    d3.select("body")
        .style("font-family", fontFamily);

    //显示参数设计
    text_opacity_normal = 0.5;
    text_opacity_mouseon = 1.0;
    node_stroke_opacity_normal = 0.6;
    node_stroke_opacity_mouseon = 1.0;
    // text_opacity_normal = 0.6;
    // text_opacity_normal = 0.6;
    // text_opacity_normal = 0.6;
    // text_opacity_normal = 0.6;
    // text_opacity_normal = 0.6;
}

function legend(svg) {
    lgdGroup = svg.append('g')
        .attr('class', 'lgdGroup')
    
    function get_color(item) {
        if(item == '普速铁路') return "#808080";
        if(item == '快速铁路') return "#A2795E";
        if(item == '高速铁路') return "#BB4444";
        return "#808080";
    }
    function get_radius(item) {
        if(item == '普通地级市') return 3;
        return 6;
    }
    function get_opacity(item) {
        if(item == '普通地级市') return 0;
        if(item == '省会及直辖市') return 0;
        return 1;
    }
    function get_x(i) {
        return rmargin * 0.9
    }
    function get_y(i) {
        return umargin * 1.5 + 15 * i
    }

    lgdCons = ['普速铁路', '快速铁路', '高速铁路', '省会及直辖市', '普通地级市']
    let lgd = svg.append('g').attr('id', 'lgd');

    let ent = lgd.selectAll('lgd-item')
        .data(lgdCons).enter()
        .append('g')
        .attr('class', 'lgd-item');
    
    ent.append('line')
        .attr('x1', (d, i) => get_x(i))
        .attr('y1', (d, i) => get_y(i))
        .attr('x2', (d, i) => get_x(i) + 30)
        .attr('y2', (d, i) => get_y(i))
        .attr('stroke', (d, i) => get_color(d))
        .attr('opacity', (d, i) => get_opacity(d))

    ent.append('circle')
        .attr('cx', (d, i) => get_x(i) + 15)
        .attr('cy', (d, i) => get_y(i))
        .attr('r', (d, i) => get_radius(d))
        .attr('stroke', (d, i) => get_color(d))
        .attr('fill', '#fff')

    ent.append('text')
        .attr('x', (d, i) => get_x(i) + 32)
        .attr('y', (d, i) => get_y(i))
        .attr('dy', '.4em')
        .attr('fill', '#444')
        .style('font-size', '13px')
        .style('cursor', 'pointer')
        .text(d => d)

    /* boundray box.
    nItems = lgdCons.length
    lgd.append('g').append('rect')
        .attr('x', get_x(0) - 15)
        .attr('y', get_y(-1))
        .attr('stroke-width', 1)
        .attr('width', 160)
        .attr('height', get_y(nItems) - get_y(-1))
        .attr('stroke', '#808080')
        .attr('fill', 'none')
    */

}

function comp(str, yy, mm) { // 判断str所对应的字符串是否在yy.mm之后
    let LL = str.split('.');
    if(parseInt(LL[0]) != yy) return parseInt(LL[0]) > yy;
    if(LL.length == 1 || parseInt(LL[1],[10]) <= mm) return false;
    return true;
}

function max_railway_service(a, b) {
    if(a == '高速铁路' || b == '高速铁路') return '高速铁路';
    if(a == '快速铁路' || b == '快速铁路') return '快速铁路';
    if(a == '普速铁路' || b == '普速铁路') return '普速铁路';
    return '无';
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

    for(let j=0; j<show_links.length; j++){
        show_links[j].best_service = '无';
        for(let i=0;i<show_links[j].railways.length;i++) {
            if (comp(show_links[j].railways[i].date, year, month)) continue;
            show_links[j].best_service = max_railway_service(show_links[j].best_service, show_links[j].railways[i].service);
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

function selected(ID) {
    return tot_selected == 1 && select_id[0] == ID;
}

function basic_configuration(svg) {
    //这个函数涉及我们之前吹出来的三种交互、以及图布局的美工之类的东西。
    svg.append('g')
        .attr('transform', `translate(${lmargin+(rmargin-lmargin)/2}, ${umargin*0.7})`)
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
        .join("path")
        .attr("stroke-width", d => 2)
        .on("mouseover", function (e, d) {// 显示tooltip
            let tooltip= d3.select('#tooltip');
            let content = get_railway_info(d.railways);
            tooltip.html(content)
                .style('position', 'absolute')
                // .style("left",(lmargin+(rmargin-lmargin)*0.8)+"px")
                // .style("top",(umargin)+"px")
                .style("left",e.clientX+5+"px")
                .style("top",e.clientY+5+"px")
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
        .on("mouseover", function (e, d) {// 鼠标悬停点上：颜色变深、显示文字、相连的边高亮、View1中出现圆环和tooltip
            d3.select(this)
                .attr('stroke-opacity', node_stroke_opacity_mouseon);
            link
                .attr('stroke-opacity', function (f) {
                    if(f.u == d.id || f.v == d.id) return 1.0;
                    return 0.3;
                });
            text_node
                .attr('display', function (f) {
                    if(f.id == d.id || f.level == 1 || selected(f.id)) return "null";
                    return "none";
                })
                .attr('opacity', function (f) {
                    if(f.id == d.id) return text_opacity_mouseon;
                    else return text_opacity_normal;
                });
            if(select_id.length == 1) {
                let tooltip = d3.select('#tooltip');

                let content = "从 " + id2cityname[select_id[0]] +' 到 ' + id2cityname[d.id] + '<br/>需要'
                 + Math.floor(result[select_id[0]][d.id]/60) + ' 小时 ' + Math.floor(result[select_id[0]][d.id]%60) + '分钟';
                // content = '1';
                tooltip.html(content)
                    .style('position', 'absolute')
                    // .style("left", (lmargin + (rmargin - lmargin) * 0.8) + "px")
                    // .style("top", (umargin) + "px")
                    .style("left",e.clientX+5+"px")
                    .style("top",e.clientY+5+"px")
                    .style('visibility', 'visible');

                let circle = d3.select('#contour');
                circle
                    .attr('cx', loc_after_trans[select_id[0]][1])
                    .attr('cy', loc_after_trans[select_id[0]][0])
                    .attr('r', Math.sqrt((loc_after_trans[select_id[0]][0]-loc_after_trans[d.id][0])**2+(loc_after_trans[select_id[0]][1]-loc_after_trans[d.id][1])**2))
                    .attr('display', 'null')
            }
        })
        .on("mouseout", function (e, d) {// 鼠标移出全部恢复
            d3.select(this)
                .attr('stroke-opacity', node_stroke_opacity_normal);
            link
                .attr('stroke-opacity', function (f) {
                    return 0.6;
                });
            text_node
                .attr('display', function (f) {
                    if(f.level == 1 || selected(f.id)) return "null";
                    return "none";
                })
                .attr('opacity', function (f) {
                    if(selected(f.id)) return text_opacity_mouseon;
                    return text_opacity_normal;
                });
            let tooltip= d3.select('#tooltip');
            tooltip.style('visibility', 'hidden');
            let circle = d3.select('#contour');
            circle.attr('display', 'none');
        })
        .on("click", function (e, d) {
            let ret = click_node(d.id);
        });

    text_node = svg.append("g")
        .selectAll("text")
        .data(show_nodes)
        .join("text")
        .text(d => id2cityname[d.id]);

}

function reset_zoom() {
    d3.select('#container')
        .select('svg')
        .transition()
        .duration(200)
        .call(zoom.transform, d3.zoomIdentity.scale(1));
}

String.prototype.format = function () {
    var values = arguments;
    return this.replace(/\{(\d+)\}/g, function (match, index) {
        if (values.length > index) {
            return values[index];
        } else {
            return "";
        }
    });
};

function drawer(need_transition) {
    function get_link_color(service) {
        if(service == '普速铁路') return "#808080";
        if(service == '快速铁路') return "#A2795E";
        if(service == '高速铁路') return "#BB4444";
        return "#ffffff"; // 应该不会显示白色的了
        // return "#d2691e";
    }
    function crossproduct(x1,y1,x2,y2) {
        return x1*y2-y1*x2;
    }
    function get_xy(u, v){ // 计算边(u,v)的三次贝塞尔曲线u所在一侧的控制点（相对位置）
        let line_cnt=0, angle_sum=0;
        for(let i=0;i<show_links.length;i++){
            let tmp=-1;
            if(show_links[i].u == u) tmp = show_links[i].v;
            else if(show_links[i].v == u) tmp = show_links[i].u;
            // console.log(u,v,tmp);
            if(tmp==-1||tmp==v||show_links[i].best_service=='无') continue;
            line_cnt++;
            angle_sum+=Math.atan2(display_loc[tmp][0]-display_loc[u][0],display_loc[tmp][1]-display_loc[u][1]);
        }
        if(line_cnt==0) return [0,0];
        let angle = angle_sum / line_cnt;
        let angle_v = Math.atan2(display_loc[v][0]-display_loc[u][0],display_loc[v][1]-display_loc[u][1]);
        // 判断是否要转180度
        // return [angle, angle_v];
        if(Math.PI/2<Math.abs(angle-angle_v) && Math.abs(angle-angle_v)<Math.PI*3/2){
            angle = Math.PI+angle;
        }
        let dis = Math.sqrt((display_loc[v][0]-display_loc[u][0])**2+(display_loc[v][1]-display_loc[u][1])**2);
        return [dis/3*Math.cos(angle), dis/3*Math.sin(angle)];
    }

    let display_loc = loc_after_trans;
    // for(let i=0;i<tot_show_nodes;i++){
    //     for(let j=i+1;j<tot_show_nodes;j++){
    //         if(display_loc[i][0]-display_loc[j][0])
    //     }
    // }
    link
        .attr('display', function (d) {if(d.best_service == '无') return "none"; return "null";})
        .attr("stroke", d => get_link_color(d.best_service))
        .attr("stroke-opacity", 0.6)
        .attr('fill', "none")
        .transition()
        .duration(function () {if(need_transition) return 1200; else return 0;})
        .attr("d", function (d) {
            let A1 = get_xy(d.u, d.v);
            let A2 = get_xy(d.v, d.u);

            let str="M {0} {1} c {2} {3}, {4} {5}, {6} {7}".format(
                display_loc[d.u][1], display_loc[d.u][0],
                // display_loc[d.u][1], display_loc[d.u][0],
                // display_loc[d.v][1], display_loc[d.v][0],
                // display_loc[d.v][1], display_loc[d.v][0]
                A1[0], A1[1],
                A2[0], A2[1],
                display_loc[d.v][1]-display_loc[d.u][1], display_loc[d.v][0]-display_loc[d.u][0],
            ) ;
            return str;
        });
        // .attr("x1", d => display_loc[d.u][1])
        // .attr("y1", d => display_loc[d.u][0])
        // .attr("x2", d => display_loc[d.v][1])
        // .attr("y2", d => display_loc[d.v][0]);

    node
        .attr("r", function (d) {if(d.level == 1) return 6; else return 3;})
        .attr("stroke", function (d) {
            let len = show_links.length;
            let tmp = '无';
            for(let i=0;i<len;i++){
                if(show_links[i].u != d.id && show_links[i].v != d.id) continue;
                tmp = max_railway_service(tmp, show_links[i].best_service);
            }
            if(tmp == '无') return '#000000';
            return get_link_color(tmp);
        })
        .attr("stroke-width", function (d) {if(d.level == 1) return 1; else return 0.5;})
        .attr('stroke-opacity', node_stroke_opacity_normal)
        .attr("fill", function (d) {
            if(selected(d.id)) return '#000000';
            else return '#ffffff';
        })
        .transition()
        .duration(function () {if(need_transition) return 1200; else return 0;})
        .attr("cx", d => display_loc[d.id][1])
        .attr("cy", d => display_loc[d.id][0]);
    text_node
        .attr('display', function (d) {if(d.level == 1 || selected(d.id)) return 'null';return 'none';})
        .attr('font-size', function (d) {if(d.level == 1) return 12; return 9;})
        .attr('opacity', function (d){
            if(selected(d.id)) return text_opacity_mouseon;
            return text_opacity_normal;
        })
        .transition()
        .duration(function () {if(need_transition) return 1200; else return 0;
        })
        .attr("x", function(d){
            let len = id2cityname[d.id].length;
            if(d.level == 1){
                if(len == 2) return display_loc[d.id][1] - 13;
                if(len == 3) return display_loc[d.id][1] - 18;
                if(len == 4) return display_loc[d.id][1] - 24;
                console.log("text length error");return 100;
            }
            else{
                if(len == 2) return display_loc[d.id][1] - 10;
                if(len == 3) return display_loc[d.id][1] - 13;
                if(len == 4) return display_loc[d.id][1] - 18;
                console.log("text length error");return 100;
            }
        })
        .attr("y", function(d) {
            if (d.level == 1) return display_loc[d.id][0] - 11;
            else return display_loc[d.id][0] - 7;
        });

}

function interactive_bar() {
    // function modify(name, _left, _top) {
    //     txt = document.getElementById(name);
    //     txt.style.position = 'absolute';
    //     txt.style.left = _left * _width + 'px';
    //     txt.style.top = _top * _height + 'px';
    // }
    // function show(name) {
    //     txt = document.getElementById(name);
    //     txt.style.display = "block";
    // }
    // function hide(name) {
    //     txt = document.getElementById(name);
    //     txt.style.display = "none";
    // }

    // modify('text_year', 0.02, 0.15);
    // modify('year', 0.02, 0.2);
    // modify('text_month', 0.02, 0.25);
    // modify('month', 0.02, 0.3);
    // modify('align', 0.04, 0.4);
    // modify('pause', 0.12, 0.3);
    // modify('undo', 0.04, 0.5);

    timeline_functions = addDateParam('timeline', '对应月份：', 1971*12+1, 2020*12+12, 1971*12+1, null);
    addSelectParam('timeline_step', '每秒推进时间', ['5年','1年','3个月','1个月'], '1年', set_timeline_step);
    // d3.select('#timeline_step')
    //     .attr('position', 'absolute')
    //     .attr('top', -1000)
}

function pos_after_transform(trans, pos){
    return [pos[0]*trans.k+trans.y, pos[1]*trans.k+trans.x];
}

function draw_graph() {

    zoom = d3.zoom()
        .scaleExtent([0.2, 20])
        .on("zoom", function (e, d) {
            if(e.transform.k == lasttrans.k && e.transform.x == lasttrans.x && e.transform.y == lasttrans.y) return;
            // let eps = 1e-4;
            // if(Math.abs(e.transform.k-lasttrans.k)<eps
            //     && Math.abs(e.transform.x-lasttrans.x)<eps
            //     && Math.abs(e.transform.y-lasttrans.y)<eps) return;
            lasttrans = e.transform;
            for(let i = 0; i < tot_show_nodes; i++){
                loc_after_trans[i] = pos_after_transform(e.transform, loc[i]);
            }
            drawer(false);
        });


    let svg = d3.select('#container')
        .select('svg')
        .attr('width', width)
        .attr('height', height)
        .call(zoom);

    interactive_bar(); // 交互模块

    legend(svg); // 图例模块，不可交互

    screener(); // 将数据预处理，并依照参数筛掉一些铁路。根据参数，将建好的边存进links和nodes里

    basic_configuration(svg); // 基本的布局设置，依赖于数据筛选器的结果

    cal_shortest_path(); // 根据links和nodes里的图，计算最短路, 并将结果以二维矩阵的形式存进result里

    graph_layout_algorithm();  // 根据result, 计算返回每个点的坐标 存在某个数组里，比如loc

    align_with_screen(); // 绘制links, nodes和text的位置，并align

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
let timeline_step=12;
function set_timeline_step(opt) {
    if(opt == '5年') timeline_step=60;
    if(opt == '1年') timeline_step=12;
    if(opt == '3个月') timeline_step=3;
    if(opt == '1个月') timeline_step=1;
}

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
    let v_new = v_old+timeline_step;
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

//下面是一些关于Timeline的附加信息的东西，还没调通，先注释掉

// svg = d3.select('#container')
//         .select('svg')
// data = [{  name: "CA",
//   '<10': 5038433,
//   '10-19': 5170341,
//   '20-29': 5809455,
//   '30-39': 5354112,
//   '40-49': 5179258,
//   '50-59': 5042094,
//   '60-69': 3737461,
//   '70-79': 2011678,
//   '≥80': 1311374,
//   'total': 38654206}]
//     svg.append("g")
//     .selectAll("g")
//     .data(series)
//     .join("g")
//       .attr("fill", d => color(d.key))
//     .selectAll("rect")
//     .data(d => d)
//     .join("rect")
//       .attr("x", (d, i) => x(d.data.name))
//       .attr("y", d => y(d[1]))
//       .attr("height", d => y(d[0]) - y(d[1]))
//       .attr("width", x.bandwidth())
//     .append("title")
//       .text(d => `${d.data.name} ${d.key}
// ${formatValue(d.data[d.key])}`);
//
//   svg.append("g")
//       .call(xAxis);
//
//   svg.append("g")
//       .call(yAxis);
//
//   return svg.node();
// }