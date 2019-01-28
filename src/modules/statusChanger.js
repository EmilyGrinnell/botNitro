function evalInContext(str)
{
    return eval(str);
}
//Eval replacement function in the context of the client

class statusChanger
{
    constructor(client)
    {
        this.client = client;
        if (this.client.statuses.length) this.changeStatus();
    }

    pickRandomStatus()
    {
        let status = (Math.random() * (this.client.statuses.length - 1)).toFixed(0);

        if (status == this.status && this.client.statuses.length > 1) this.pickRandomStatus();
        else return status;
        //Pick a random status different to the current one if more than one are available
    }

    changeStatus()
    {
        this.status = this.pickRandomStatus() || 0;
        let status = this.client.statuses[this.status];
        let text = status[0];

        for (let x = 0; x < Object.keys(status[2]).length; x ++) text = text.replace(new RegExp(`{${Object.keys(status[2])[x]}}`, "g"), evalInContext.apply(this.client, [Object.values(status[2])[x]]));
        this.client.user.setActivity(`${text} || ${this.client.config._main.prefix}help`, {type : status[1]}).catch(() => null);
        //Set status to a randomly selected one

        setTimeout(() => this.changeStatus(), 60000);
        //Change status every minute
    }
}

module.exports = statusChanger;