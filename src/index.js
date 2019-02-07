const childProcess = require("child_process");
const path = require("path");
const dependencies = Object.keys(require("../package.json").dependencies);
let errors = 0;

function start(code)
{
    if (code == 1) setTimeout(() => errors --, 120000);

    childProcess.fork(path.resolve(__dirname, "./bot.js"), [], {stdio : [0, 1, 2, "ipc"]})
        .on("message", message => {if (message == "QUIT") process.exit()})
        .on("exit", code => {
            if (code != 1 || ++ errors < 25) return start(code);

            console.log("\x1b[1m\x1b[31mToo many errors occurred in a short time, not restarting\x1b[0m");
            process.exit();
        });
}

try
{
    for (let x = 0; x < dependencies.length; x ++) require(dependencies[x]);
    start();
}
catch (e)
{
    console.log("\x1b[1m\x1b[31mMissing required dependencies. Attempting to install them\x1b[0m");

    childProcess.exec("npm install", (err, stdout, stderr) => {
        if (err || stderr) return console.log(`\x1b[1m\x1b[35mError installing dependencies:\nx1b[31m${err || stderr}\x1b[0m`);

        console.log("\x1b[1m\x1b[35mSuccessfully installed required dependencies\x1b[0m");
        start();
    });
}