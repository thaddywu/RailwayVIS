/*
* Tool functions
*/

function cal_shortest_path(){
    // result = xxxx
}


// 下面的都是和图布局有关的代码，先注释着
// function random_graph(nodes, links) {
//     //这是一个随机布局
//     for (i in nodes) {
//         for (k = 0; k < 10000; k++) {
//             nodes[i].x = Math.random() * 0.8 * width + 0.1 * width;
//             nodes[i].y = Math.random() * 0.8 * height + 0.1 * height;
//         }
//     }
//     //floyd(nodes, links);
// }
// function polygon(nodes, links) {
//     //初始位置为正多边形
//     let R = 200;
//     for (let i in nodes) {
//         nodes[i].x = 0.5 * width + Math.cos(i/n *2*Math.PI) * R;
//         nodes[i].y = 0.5 * height + Math.sin(i/n*2*Math.PI) * R;
//     }
//     floyd(nodes, links);
// }
// function dis(a, b) {
//     return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
// }
// function normalize(nodes, links) {
//     let minx = Math.min.apply(Math, nodes.map(function f(d) {return d.x}));
//     let maxx = Math.max.apply(Math, nodes.map(function f(d) {return d.x}));
//     let miny = Math.min.apply(Math, nodes.map(function f(d) {return d.y}));
//     let maxy = Math.max.apply(Math, nodes.map(function f(d) {return d.y}));
//
//     if (minx != maxx && miny != maxy)
//         nodes.forEach((d, i) => {
//             d.x = (d.x - minx) / (maxx - minx) * (rmargin - lmargin) + lmargin;
//             d.y = (d.y - miny) / (maxy - miny) * (dmargin - umargin) + umargin;
//         });
// }
//
//
// function final_algorithm(nodes, links, M=200, c1=5, c2=0.1, c3=0.05, c4=0.1) {
//     //c1:弹簧初始长度,c2:引力参数,c3:斥力参数,c4：边界斥力参数:
//     let deltax = [];
//     let deltay = [];
//     let v_x = [];
//     let v_y = [];
//     for(let i = 0; i < n; i++){
//         v_x[i] = 0;
//         v_y[i] = 0;
//     }
//     for (let T = 0; T < M; T++){
//         for(let i = 0; i < n; i++){
//             deltax[i] = 0;
//             deltay[i] = 0;
//         }
//         for (let l in links){
//             let i = nodes2num[links[l].source];
//             let j = nodes2num[links[l].target];
//             if(i == j) continue;
//             let k = c1 * Math.sqrt(nodes[i].weight * nodes[j].weight);
//             let dd = dis(nodes[i],nodes[j]);
//             let F = (dd*dd/ k - k*k/dd) * c2;
//             F = Math.min(F, 1);
//             F = Math.max(F, -1);
//             deltax[i] += (nodes[j].x-nodes[i].x)/dd*F;
//             deltay[i] += (nodes[j].y-nodes[i].y)/dd*F;
//             deltax[j] += (nodes[i].x-nodes[j].x)/dd*F;
//             deltay[j] += (nodes[i].y-nodes[j].y)/dd*F;
//             //console.log(deltax[i], deltay[i],dd,nodes[i].x,nodes[i].y,nodes[j].x,nodes[j].y,'!',F);
//         }
//         for(let i = 0; i < n; i++){
//             for(let j = i+1; j < n; j++) {
//                 let dd = dis(nodes[i],nodes[j]);
//                 let F = c3 * nodes[i].weight * nodes[j].weight/dd;
//                 if(dd < 20) F *= 10;
//                 F = Math.min(F, 1);
//                 F = Math.max(F, -1);
//                 //console.log((nodes[j].x-nodes[i].x)/dd*F,'!');
//                 deltax[i] -= (nodes[j].x-nodes[i].x)/dd*F;
//                 deltay[i] -= (nodes[j].y-nodes[i].y)/dd*F;
//                 deltax[j] -= (nodes[i].x-nodes[j].x)/dd*F;
//                 deltay[j] -= (nodes[i].y-nodes[j].y)/dd*F;
//             }
//         }
//         for(let i = 0; i < n; i++){
//             if(nodes[i].x < lmargin) deltax[i] += (lmargin - nodes[i].x) * c4;
//             if(nodes[i].x > rmargin) deltax[i] += (rmargin - nodes[i].x) * c4;
//             if(nodes[i].y < umargin) deltay[i] += (umargin - nodes[i].y) * c4;
//             if(nodes[i].y > dmargin) deltay[i] += (dmargin - nodes[i].y) * c4;
//             v_x[i] = 0.9 * v_x[i] + deltax[i];
//             v_y[i] = 0.9 * v_y[i] + deltay[i];
//             nodes[i].x += v_x[i];
//             nodes[i].y += v_y[i];
//             /*if(nodes[i].x < lmargin) nodes[i].x += (lmargin - nodes[i].x) * c4;
//             if(nodes[i].x > rmargin) nodes[i].x += (rmargin - nodes[i].x) * c4;
//             if(nodes[i].y < umargin) nodes[i].y += (umargin - nodes[i].y) * c4;
//             if(nodes[i].y > dmargin) nodes[i].y += (dmargin - nodes[i].y) * c4;*/
//         }
//     }
// }