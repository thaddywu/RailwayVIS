function graph_layout_algorithm(){
    //geographical_position(); // TODO 现在这个函数是仅根据地理位置来计算，理想的布局算法由 @lzg 来完成一下
    set_pos();

    console.log("pos = ", loc);
}

function project_to_screen(hh, ww) { // hh, ww为[0,1]之间的小数，这个函数将这个区间上的值映射到整个屏幕去掉margin的中间部分
    return [umargin+(dmargin-umargin)*hh, lmargin+(rmargin-lmargin)*ww];
}

function geographical_position(){
    //经度大概在90-130, 纬度在20-50
    for(let i = 0; i < tot_show_nodes; i++){
        loc[i] = project_to_screen((50 - real_position[i][1])/30, (real_position[i][0]-90)/40);
    }
}

function set_pos(){
    // 一共有tot_show_nodes个点需要计算位置，标号为0-tot_show_nodes-1，两两的距离存在了result里
    // 如果需要的话，可以使用real_position数组，里面按标号存了实际的经纬度
    // 最后把结果像上面函数一样存进loc里就行
    // console.log("result = ", result);
    // console.log("result len = ", result.length);
    // console.log("point_num = ", tot_show_nodes);
    compute_position = mds.classic(result);

    for(let i = 0; i < tot_show_nodes; i++){
        loc[i] = project_to_screen((20 + compute_position[i][1])/30, (compute_position[i][0] + 20)/40);
    }
}

// 下面开始是关于交互部分的位置计算与显示
function View1(ID) {  // 第一视图:有一个点在中间
    console.log("Enter View 1! ID=",ID);
}
function View2(ID1, ID2) {  // 第二视图:选了两个点
    console.log("Enter View 2! ID1=",ID1, ", ID2=", ID2);
}
function Recovery() {  // 恢复正常视图
    console.log("Recovery");
}