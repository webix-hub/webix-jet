const puppeteer = require("./puppeteer");

const path = require("path");
const chalk = require("chalk");

async function runner(cmd){
    cmd = cmd || {};

    // start browser and dev. server
    const globalPuppeteer = await puppeteer();
    const config = {
        devtools: true,
        headless: false,
        slowMo: 250
    }

    const browser = await globalPuppeteer.launch(cmd.visible ? config: {});

	try {
        const page = await browser.newPage();
        page.on("pageerror", error);
        page.on('console', async function(msg){
            let data = msg.args().map(a => a.jsonValue());
            data = await Promise.all(data);

            switch(msg.type()){
                case "error":
                    data[0] = chalk.red(data[0]);
                    break;
                case "warning":
                    data[0] = chalk.yellow(data[0]);
                    break;
                default:
                    if (data[0].toString().indexOf("✓") !== -1)
                        data[0] = chalk.green(data[0]);
                    break;
            }
            console.log.apply(console, data);
        });


        const fullpath = path.resolve(__dirname+"/../index.html");
        await page.goto("file://"+fullpath, { waitUntil: 'networkidle2' });

    } catch(e){
        error(e);
    }

	await browser.close();
}

function error(err){  	
    if (err.toString() === "NavigationBlocked") return;

    console.log(chalk.red("Page error: " + err.toString())); 
    console.log(err.code, err.message);
}

function timeout(time){
	return new Promise(resolve => setTimeout(resolve, time));
}

runner();

module.exports = runner;