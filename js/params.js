var params = {}

var firstFloatParam = true
var curParam = null
// var lastX = 0

function addFloatParam(name, description, min_value, max_value, default_value, callback) {
    d3.select('#bottombar-container')
    .append('div')
    .classed('param-container', true)
    .html(`
        <p class="param-title">${description}</p>
        <div class="slide" draggable="false" id="${name}-slide">
            <div class="progress" id="${name}-progress"></div>
            <div class="handle" draggable="false" id="${name}-handle"></div>
        </div>
        <p class="param-value" id="${name}-value"></p>
    `)

    let slide = $(`#${name}-slide`)
    let handle = $(`#${name}-handle`)
    let progress = $(`#${name}-progress`)
    let display = $(`#${name}-value`)

    let init = true

    const v2p = (v) => {
        v = Math.max(v, min_value)
        v = Math.min(v, max_value)
        let ratio = (v - min_value) / (max_value - min_value)
        return slide.width() * ratio
    }

    const p2v = (p) => {
        let ratio = p / slide.width()

        ratio = Math.min(ratio, 1)
        ratio = Math.max(ratio, 0)

        let v = ratio * (max_value - min_value) + min_value
        return v
    }

    const setValue = (v) => {
        if(v == params[name])
            return
        params[name] = v
        display.text(v.toFixed(2))

        let p = v2p(v)
        handle.offset({left: p + 9})
        progress.width(p)

        if(!init) {
            if(typeof(callback) == 'function')
                callback(v)
        }
        else
            init = false
    }

    setValue(default_value)

    handle.on('mousedown', (e) => {
        lastX = e.clientX
        curParam = {
            progress,
            setValue,
            p2v
        }
    })

    if(firstFloatParam) {
        firstFloatParam = false

        document.addEventListener('mousemove', (e) => {
            if(!curParam)
                return
            let x = e.clientX
            let diffX = x - lastX

            let progress = curParam.progress
            let p2v = curParam.p2v
            let setValue = curParam.setValue

            let p = progress.width() + diffX
            let v = p2v(p)
            setValue(v)
            lastX = x
        })

        document.addEventListener('mouseup', (e) => {
            curParam = null
        })
    }
}

function addDateParam(name, description, min_value, max_value, default_value, callback) {
    d3.select('#bottombar-container1')
    .append('div')
    .classed('param-container', true)
    .html(`
        <p class="param-title">${description}</p>
        <div class="slide" draggable="false" id="${name}-slide">
            <div class="progress" id="${name}-progress"></div>
            <div class="handle" draggable="false" id="${name}-handle"></div>
        </div>
        <img class="param-button1" id="pause" src="icon/pause.jpg" onclick="pause()" alt="炸了"/>
        <img class="param-button2" id="align" src="icon/align.jpg" onclick="align_with_screen()"/>
        <img class="param-button3" id="undo" src="icon/undo.jpg" onclick="undo()"/>
        <p class="param-value" id="${name}-value"></p>
    `)

    let slide = $(`#${name}-slide`)
    let handle = $(`#${name}-handle`)
    let progress = $(`#${name}-progress`)
    let display = $(`#${name}-value`)

    let init = true

    const v2p = (v) => {
        v = Math.max(v, min_value)
        v = Math.min(v, max_value)
        let ratio = (v - min_value) / (max_value - min_value)
        return slide.width() * ratio
    }

    const p2v = (p) => {
        let ratio = p / slide.width()

        ratio = Math.min(ratio, 1)
        ratio = Math.max(ratio, 0)

        let v = ratio * (max_value - min_value) + min_value
        return v
    }

    const setValue = (v) => {
        let v_int = Math.round(v);
        if(v_int == params[name])
            return;
        params[name] = v_int;
        year = Math.floor((v_int-1)/12);
        month = (v_int-1)%12+1;
        display.text(year+'年'+month+'月');

        let p = v2p(v);
        handle.offset({left: p + 9});
        progress.width(p);

        if(!init) {
            if(typeof(callback) == 'function')
                callback(v)
        }
        else
            init = false
    }

    const getv = () => {
        return p2v(progress.width());
    }

    setValue(default_value)

    handle.on('mousedown', (e) => {
        // lastX = e.clientX
        curParam = {
            // progress,
            setValue,
            p2v
        }
    })

    if(firstFloatParam) {
        firstFloatParam = false

        document.addEventListener('mousemove', (e) => {
            if(!curParam)
                return
            let x = e.clientX
            // let diffX = x - lastX

            // let progress = curParam.progress
            let p2v = curParam.p2v
            let setValue = curParam.setValue

            // let p = progress.width() + diffX
            let p = x;
            let v = p2v(p)
            setValue(v)
            // lastX = x
        })

        document.addEventListener('mouseup', (e) => {
            curParam = null
            screener();
            cal_shortest_path();
            view_show();
        })
    }

    return {'getv': getv, 'setv': setValue};
}

function addSelectParam(name, description, value_list, default_value, callback) {
    let container = d3.select('#bottombar-container2')
    .append('div')
    // .classed('param-container', true)
        .attr('id', name)
    // .attr('top', 0)
    //     .attr('left', 1000)
    //     .attr('width', 200)
    .html(`
        <p class="param-title" id="${name}-param-title">${description}</p>
        </p>
    `)


    let options = {}
    let curValue = undefined
    let init = true

    let setValue = (v) => {
        if(v == curValue)
            return;
        if(curValue) {
            options[curValue].classed('selected-option', false)
        }
        options[v].classed('selected-option', true)
        curValue = params[name] = v

        if(!init) {
            if(typeof(callback) == 'function')
                callback(v)
        }
        else
            init = false
    }

    let inner = container.append('div')

    for(let v of value_list) {
        let p = inner.append('p')
        .classed('param-option', true)
        .text(v)

        options[v] = p

        p.on('click', () => {setValue(v)})
    }

    setValue(default_value)
}


function addClickBotton(name, description, text, callback) {
    let container = d3.select('#bottombar-container')
        .append('div')
        .classed('param-container', true)

    if (description != '') {
        container.append('p')
            .classed('param-title', true)
            .html(description)
    }

    let inner = container.append('div')

    let p = inner.append('p')
        .classed('button', true)
        .style('width', '100%')
        .style('margin', '0')
        .text(text)
        .on('click', callback);
}


function addMultiSelectParam(name, description, value_list, default_value, callback) {
    let container = d3.select('#bottombar-container')
    .append('div')
    .classed('param-container', true)

    container.append('p')
    .classed('param-title', true)
    .html(description)

    let options = {}

    params[name] = {}
    for(let v of value_list) {
        params[name][v] = false
    }
    for(let v of default_value) {
        params[name][v] = true
    }

    let changeValue = (v) => {
        if(params[name][v]) {
            options[v].classed('selected-option', false)
        } else {
            options[v].classed('selected-option', true)
        }
        params[name][v] = !params[name][v]
        callback(params[name])
    }

    let inner = container.append('div')

    for(let v of value_list) {
        let p = inner.append('p')
        .classed('param-option', true)
        .text(v)

        options[v] = p

        if(params[name][v])
            p.classed('selected-option', true)

        p.on('click', () => {changeValue(v)})
    }

    let ops = container.append('div').style('text-aligned', 'center')
    ops.append('p')
    .classed('button', true)
    .text('RESET')
    .on('click', () => {
        for(let v of value_list) {
            params[name][v] = false
            options[v].classed('selected-option', false)
        }
        for(let v of default_value) {
            params[name][v] = true
            options[v].classed('selected-option', true)
        }
        callback(params[name])
    })

    ops.append('p')
    .classed('button', true)
    .text('CLEAR')
    .on('click', () => {
        for(let v of value_list) {
            params[name][v] = false
            options[v].classed('selected-option', false)
        }
        callback(params[name])
    })

    ops.append('p')
    .classed('button', true)
    .text('ALL')
    .on('click', () => {
        for(let v of value_list) {
            params[name][v] = true
            options[v].classed('selected-option', true)
        }
        callback(params[name])
    })
}