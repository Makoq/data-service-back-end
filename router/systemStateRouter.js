var os = require('os')
var cpuu =  require('cputilization')

exports.systemStatus =  function (req, res) {
    // 计算CPU使用情况
    cpuu((err, sample)=>{
        var cpuUsage = sample.percentageBusy().toFixed(4);
        var mem =  Number((1-os.freemem()/os.totalmem()).toFixed(4));
        const time = new Date().toLocaleTimeString('it-IT');
        res.send({
           mem: mem,
           timer: time,
            cpu: cpuUsage
        });
    });
};
