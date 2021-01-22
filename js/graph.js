function graph_layout_algorithm(){
    set_pos();
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

function avgpos_compute(pos){
    let sum_w = 0;
    let sum_h = 0;

    for(let i = 0; i < pos.length; i++){
        sum_w += pos[i][0];
        sum_h += pos[i][1];
    }

    let avgpos = [sum_w/pos.length, sum_h/pos.length];

    return avgpos;
}

function cartesian2Polar(x, y){
    let distance = Math.sqrt(x*x + y*y)
    let radians = Math.atan2(y,x) //This takes y first
    
    let polarCoor = { distance:distance, radians:radians }
    return polarCoor
}

function Polar2cartesian(d, r){
    let x = d*Math.cos(r);
    let y = d*Math.sin(r);
    return {x: x, y: y}
}


let const_Vmain_scale = 4;

var STANDARD_AVGPOS = [];     // 重心位置
var support_cityname = "乌鲁木齐";    // 选取方向固定城市名
var STANDARD_ANGLE = 210/180*Math.PI; //  方向固定城市具体角度
var Vmain_scale = const_Vmain_scale;         // 缩放比例
var support_cityname2 = "哈尔滨";     // 决定是否翻转x的参考城市
var support_cityname3 = "昆明";       // 决定是否翻转y的参考城市

function set_pos(){
    // 一共有tot_show_nodes个点需要计算位置，标号为0-tot_show_nodes-1，两两的距离存在了result里
    // 如果需要的话，可以使用real_position数组，里面按标号存了实际的经纬度
    // 最后把结果像上面函数一样存进loc里就行
    //console.log("result = ", result);
    // console.log("result len = ", result.length);
    // console.log("point_num = ", tot_show_nodes);
    STANDARD_AVGPOS = [lmargin+(rmargin-lmargin)/2, umargin+(dmargin-umargin)/2];
    let compute_position = mds.classic(result);
    // console.log(compute_position);

    // 这一段是为了固定重心
    for(let i = 0; i <tot_show_nodes; i++){
        compute_position[i][0] /= Vmain_scale;
        compute_position[i][1] /= Vmain_scale;
    }

    let avgpos = avgpos_compute(compute_position);
    let bias = [STANDARD_AVGPOS[0] - avgpos[0], STANDARD_AVGPOS[1] - avgpos[1]];

    for(let i = 0; i <tot_show_nodes; i++){
        compute_position[i][0] += bias[0];
        compute_position[i][1] += bias[1];
    }

    avgpos = avgpos_compute(compute_position);

    //console.log("avgpos = ", avgpos);

    // 选取重心与某个特定城市方向不变 supportcityname
    // 对地图进行整个旋转
    let support_cityid = id2cityname.indexOf(support_cityname);
    let support_cityid2 = id2cityname.indexOf(support_cityname2);
    let support_cityid3 = id2cityname.indexOf(support_cityname3);

    let support_citypos = [compute_position[support_cityid][0], compute_position[support_cityid][1]];
    let now_support_cityangle = cartesian2Polar(support_citypos[0] - avgpos[0], support_citypos[1] - avgpos[1]).radians;

    let angle_bias = STANDARD_ANGLE - now_support_cityangle;

    for(let i = 0; i < tot_show_nodes; i++){
        let polarpos = cartesian2Polar(compute_position[i][0] - avgpos[0], compute_position[i][1] - avgpos[1]);
        let newpos = Polar2cartesian(polarpos.distance, polarpos.radians + angle_bias);
        compute_position[i] = [newpos.x + avgpos[0], newpos.y + avgpos[1]];

        // if(i == support_cityid)
        //     console.log(cartesian2Polar(compute_position[i][0] - avgpos[0], compute_position[i][1] - avgpos[1]));
    }

    let support_citypos2 = [compute_position[support_cityid2][0], compute_position[support_cityid2][1]];
    let support_citypos3 = [compute_position[support_cityid3][0], compute_position[support_cityid3][1]];

    if(support_citypos2[1] > support_citypos3[1]){
        for(let i = 0; i < tot_show_nodes; i++){
            compute_position[i][1] = 2*avgpos[1] - compute_position[i][1];
        }
    }

    support_citypos = [compute_position[support_cityid][0], compute_position[support_cityid][1]];
    now_support_cityangle = cartesian2Polar(support_citypos[0] - avgpos[0], support_citypos[1] - avgpos[1]).radians;

    angle_bias = STANDARD_ANGLE - now_support_cityangle;

    for(let i = 0; i < tot_show_nodes; i++){
        let polarpos = cartesian2Polar(compute_position[i][0] - avgpos[0], compute_position[i][1] - avgpos[1]);
        let newpos = Polar2cartesian(polarpos.distance, polarpos.radians + angle_bias);
        compute_position[i] = [newpos.x + avgpos[0], newpos.y + avgpos[1]];

        // if(i == support_cityid)
        //     console.log(cartesian2Polar(compute_position[i][0] - avgpos[0], compute_position[i][1] - avgpos[1]));
    }

    for(let i = 0; i < tot_show_nodes; i++){
        loc[i] = [compute_position[i][1], compute_position[i][0]];
    }
}

// 下面开始是关于交互部分的位置计算与显示
function view_show(){
    if(tot_selected == 0){
        Viewmain();
    }
    else if(tot_selected == 1){
        View1(select_id[0]);
    }
    else{
        View2(select_id[0], select_id[1]);
    }
}

function Viewmain(){
    graph_layout_algorithm();
    for(let i = 0; i < tot_show_nodes; i++){
        loc_after_trans[i] = pos_after_transform(lasttrans, loc[i]);
    }
    drawer(false);
}

let const_V1_scale = 1;
let V1_scale = const_V1_scale;
function View1(ID) {  // 第一视图:有一个点在中间
    // console.log("Enter View 1! ID=",ID);
    loc[ID] = project_to_screen(0.5, 0.5);
    for(let i = 0; i < tot_show_nodes; i++){
        if(i == ID) continue;
        let real_dis = get_realdis(real_position[i], real_position[ID]);
        let now_dis = result[i][ID];
        loc[i][0] = loc[ID][0] + (real_position[ID][1] - real_position[i][1])*(now_dis/real_dis) * V1_scale;
        loc[i][1] = loc[ID][1] + (real_position[i][0] - real_position[ID][0])*(now_dis/real_dis) * V1_scale;
        loc_after_trans[i] = loc[i];
    }
    drawer(true);
}
function View2(ID1, ID2) {  // 第二视图:选了两个点
    // console.log("Enter View 2! ID1=",ID1, ", ID2=", ID2);
}
function Recovery() {  // 恢复正常视图
    // console.log("Recovery");
    graph_layout_algorithm();
    for(let i = 0; i < tot_show_nodes; i++){
        loc_after_trans[i] = loc[i];
    }
    drawer(true);
}

function align_with_screen() {  // 将当前的图拉伸至屏幕刚好能装下
    function align_main() {
        let maxw = 0, maxh = 0;
        for(let i = 0; i < tot_show_nodes; i++){
            maxh = Math.max(maxh, Math.abs(loc[i][0] - STANDARD_AVGPOS[1]));
            maxw = Math.max(maxw, Math.abs(loc[i][1] - STANDARD_AVGPOS[0]));
        }
        console.log(maxw, maxh);
        let tmp = Math.min((rmargin-lmargin)/2/maxw, (dmargin-umargin)/2/maxh);
        Vmain_scale /= tmp;
        Recovery();
    }
    function align_1() {
        let ID = select_id[0];
        let maxw = 0, maxh = 0;
        for(let i = 0; i < tot_show_nodes; i++){
            if(i == ID) continue;
            maxh = Math.max(maxh, Math.abs(loc[i][0] - loc[ID][0]));
            maxw = Math.max(maxw, Math.abs(loc[i][1] - loc[ID][1]));
        }
        console.log(maxw, maxh);
        let tmp = Math.min((rmargin-lmargin)/2/maxw, (dmargin-umargin)/2/maxh);
        V1_scale *= tmp;
        View1(ID);
    }
    function align_2() {

    }

    if(tot_selected == 0) align_main();
    else if(tot_selected == 1) align_1();

    for(let i = 0; i < tot_show_nodes; i++){
        loc_after_trans[i] = loc[i];
    }
}