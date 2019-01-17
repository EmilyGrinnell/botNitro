const childProcess = require("child_process");
const path = require("path");
const dependencies = Object.keys(require("../package.json").dependencies);
const timeouts = [];

function start()
{
    const main = childProcess.fork(`${path.relative("./", __dirname)}/bot.js`, [], {stdio : [0, 1, 2, "ipc"]});

    main.on("exit", code => {
        switch (code)
        {
            case 1:
                if (timeouts.length < 100)
                {
                    timeouts.push(setTimeout(() => {timeouts.splice(0, 1)}, 60000));
                    return start();
                }
                else
                {
                    for (var x = 0; x < timeouts.length; x ++) clearTimeout(timeouts[x]);
                    return console.log("\x1b[1m\x1b[35mToo many errors occurred in a short time, not restarting\x1b[0m");
                }
            case 200:
                break;
            default:
                start();
        }
    });
}

try
{
    for (var x = 0; x < dependencies.length; x ++) require(dependencies[x]);
    start();
}
catch (e)
{
    console.log("\x1b[1m\x1b[31mMissing required dependencies. Attempting to install them\x1b[0m");
    childProcess.exec("npm install", (err, stdout, stderr) => {
        if (err || stderr) console.log(`\x1b[1m\x1b[35mError installing dependencies:\nx1b[31m${err || stderr}\x1b[0m`);
        else
        {
            console.log("\x1b[1m\x1b[35mSuccessfully installed required dependencies\x1b[0m");
            start();
        }
    });
}