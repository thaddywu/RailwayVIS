function add_edge(ff, tt, ww) {
    tot_edges++;
    to[tot_edges] = tt;
    nxt[tot_edges] = head[ff];
    weight[tot_edges] = ww;
    head[ff] = tot_edges;
}

function get_realdis(a, b) {
    return Math.sqrt((a[0]-b[0])**2+(a[1]-b[1])**2);
}

function cal_shortest_path(){
    floyd();
    // dijkstra();
}

function floyd(){
    let links = new Array(tot_nodes);
    for(let i = 0; i < tot_nodes; i++){
        links[i] = new Array(tot_nodes);
        for(let j = 0; j < tot_nodes; j++){
            links[i][j] = 1e9;
        }
        links[i][i] = 0;
    }
    for(let x = 0; x < tot_nodes; x++){
        for(let i = head[x]; i; i = nxt[i]){
            let y = to[i];
            links[x][y] = Math.min(links[x][y], weight[i]);
        }
    }
    for(let k = 0; k < tot_nodes; k++){
        for(let i = 0; i < tot_nodes; i++){
            for(let j = 0; j < tot_nodes; j++){
                links[i][j] = Math.min(links[i][j], links[i][k]+links[k][j]);
            }
        }
    }
    for(let i = 0; i < tot_show_nodes; i++){
        for(let j = 0; j < tot_show_nodes; j++){
            result[i][j] = links[i][j];
        }
    }
}

function dijkstra(){
    // result = xxxx
}
