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

function greater(a, b){ // return a > b?
    if(a[0]!=b[0]) return a[0]>b[0];
    return a[1]>b[1];
}

var Heap = {
    heap: [],
    cnt: 0,
    swap: function(idx1,idx2){
    　　let temp = this.heap[idx1];
    　　this.heap[idx1] = this.heap[idx2];
    　　this.heap[idx2] = temp;
    },
    shiftup: function(idx){
    　　let _idx = Math.floor((idx - 1) / 2);
    　　if(idx != 0 && greater(this.heap[_idx], this.heap[idx])){
        　　this.swap(_idx,idx);
        　　this.shiftup(_idx);
        }
    },
    shiftDown: function(idx){
        if(idx * 2 + 1 >= this.heap.length){
            return;
        }
        if(idx * 2 + 2 == this.heap.length){
            if(greater(this.heap[idx], this.heap[idx * 2 + 1])){
        　　　　this.swap(idx * 2 + 1,idx);
            }
        　　return;
        }
    　　if(greater(this.heap[idx * 2 + 1], this.heap[idx * 2 + 2])){
            if(greater(this.heap[idx], this.heap[idx * 2 + 2])) {
                this.swap(idx * 2 + 2,idx);
                this.shiftDown(idx * 2 + 2);
            }
    　　}
        else{
            if(greater(this.heap[idx], this.heap[idx * 2 + 1])) {
                this.swap(idx * 2 + 1,idx);
                this.shiftDown(idx * 2 + 1);
            }
        }
    },
    insert: function(val){
    　　this.heap.push(val);
    　　this.shiftup(this.heap.length - 1);
        this.cnt++;
    },
    pop: function(){
    　　this.swap(0, this.heap.length - 1);
    　　this.heap.pop();
    　　this.shiftDown(0);
        this.cnt--;
    },
    top: function () {
        return this.heap[0];
    },
    clear: function () {
        this.heap = [];
        this.cnt = 0;
    }
};

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
            // result[i][j] = links[i][j];
            result[i][j] = (links[i][j] + links[j][i]) / 2;
        }
    }
}

function dijkstra(){
    let Q = Object.create(Heap);
    let vis = Array(tot_nodes), dis = Array(tot_nodes);
    for(let S = 0; S < tot_show_nodes; S++){
        Q.clear();
        for(let i = 0; i < tot_nodes; i++){
            vis[i] = false;
            dis[i] = 1e9;
        }
        Q.insert([0,S]); dis[S]=0;
        while(Q.cnt > 0){
            let P = Q.top(), x = P[1]; Q.pop();
            if(vis[x]) continue;
            for(let i = head[x]; i; i = nxt[i]){
                let y = to[i];
                if(dis[y] > dis[x] + weight[i]){
                    dis[y] = dis[x] + weight[i];
                    Q.insert([dis[y], y]);
                }
            }
        }
        for(let i = 0; i < tot_show_nodes; i++){
            result[S][i] = dis[i];
        }
    }
}
