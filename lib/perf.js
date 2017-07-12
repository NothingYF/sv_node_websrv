/**
 * Created by Nothing on 2017/7/11.
 */

const logger = require('sv_node_share').logger('websrv:perf');



var perf = function () {
    //实例化对象
    if(!(this instanceof perf)){
        return new perf();
    }

    //输入字节数
    var input_bytes = 0;

    //输出字节数
    var output_bytes = 0;

    //任务数
    var total_task = 0;

    //响应时间
    var rt = 0;

    //定时器
    var timer;

    //性能参数
    var perf_object = {
        //每分钟处理任务数
        tpmc : 0,

        //每秒输入流量(字节数)
        input : 0,

        //每秒输出流量(字节数)
        output : 0,

        //平均响应时间
        art : 0
    }

    /**
     * 清除变量
     */
    function clear() {
        input_bytes = 0;
        output_bytes = 0;
        total_task = 0;
        rt = 0;
    }

    /**
     * 获取性能参数
     * @returns {{tpmc: number, input: number, output: number, art: number}}
     */
    perf.prototype.value = ()=>{
        return perf_object;
    }

    /**
     * 启动
     */
    perf.prototype.start = ()=>{

        timer = setInterval(function () {

            perf_object.input = input_bytes;
            perf_object.output = output_bytes;
            perf_object.tpmc = total_task;
            perf_object.art = (rt / 60).toFixed(1);

            logger.info(perf_object);

            clear();

        }, 60000);
    }

    /**
     * 停止
     */
    perf.prototype.stop = ()=>{
        if(timer)
            clearInterval(timer);

        clear();
    }

    /**
     * 输入流量
     * @param bytes
     */
    perf.prototype.input = (bytes)=>{
        input_bytes += bytes;
    }

    /**
     * 输出流量
     * @param bytes
     */
    perf.prototype.output = (bytes)=>{
        output_bytes += bytes;
    }

    /**
     * 任务处理
     */
    perf.prototype.add_task = ()=>{
        total_task++;
    }

    /**
     * 响应时间
     * @param ms
     */
    perf.prototype.rt = (ms)=>{
        rt += ms;
    }

}

exports = module.exports = perf;
