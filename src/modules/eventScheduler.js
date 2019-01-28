const fs = require("fs");
const path = require("path");

class eventScheduler extends Array
{
    constructor(client)
    {
        super();
        this.client = client;
        this.timeouts = [];

        let events = fs.existsSync(`${path.relative("./", __dirname)}/../config/events.json`) ? require("../config/events.json") : [];
        for (let x = 0; x < events.length; x ++) this.addEvent(events[x].date, eval(`(${events[x].func})`), events[x].thisVal);
        //Load saved events
    }

    addEvent(date, func, thisVal)
    {
        this.push({date, func, thisVal});
        this.saveEvents();

        this.timeouts.push(setTimeout(() => {
            func.apply(eval(thisVal));

            this.removeEvent(this.findIndex(item => item.date == date && item.func == func && item.thisVal == thisVal));
        }, date - Date.now()));
        //Set timeout for event and save it to file
    }

    saveEvents()
    {
        let events = [];
        
        for (let x = 0; x < this.length; x ++) events.push({date : this[x].date, func : this[x].func.toString(), thisVal : this[x].thisVal});
        fs.writeFileSync(`${path.relative("./", __dirname)}/../config/events.json`, JSON.stringify(events, null, 4));
        //Save events to file
    }

    removeEvent(index)
    {
        clearTimeout(this.timeouts.splice(index, 1)[0]);
        //Clear timeout

        for (; index < this.length - 1; index ++) this[index] = this[index + 1];
        //Shift all elements back 1
        
        this.length --;
        this.saveEvents();
        //Remove event without using .splice so constructor isn't called
    }
}

module.exports = eventScheduler;
//Save timeouts in a file to avoid them being lost on restart
