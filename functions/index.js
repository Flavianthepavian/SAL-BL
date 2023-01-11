const puppeteer = require("puppeteer");
const {convert} = require('html-to-text');

const scrapeImage = async () => {
    const start = Date.now();
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();

    await page.goto("https://sal.portal.bl.ch/sekow/index.php?login");

    await page.type("[name=isiwebuserid]", "e254989");
    await page.type("[name=isiwebpasswd]", "flazu66.100%");

    await page.click("[type=submit]");

    await page.waitForSelector("img ", {
        visible: true
    });

    await page.click("[id=menu21311]");

    await page.waitForSelector("img ", {
        visible: true
    });

    let temp = await page.evaluate(() => {
        let data = [];
        let elements = document.getElementsByClassName('mdl-data-table mdl-js-data-table mdl-table--listtable');
        for (let element of elements)
            data.push(element.innerHTML);
        return data;
    });

    let values = convert(temp[0], {wordwrap: 130});

    values = values.replace("Kurs Notendurchschnitt Bestätigt ", "");

    let marks = {}

    function getDetails(string){
        let details = {}
        details["schnitt"] = string.split("\n")[1].split(" ")[string.split("\n")[1].split(" ").length - 1];
        details["fach"] = string.split("\n")[1].replace(" " + details["schnitt"], "");
        details["bestatigt"] = (string.split("\n")[4] === "ja");
        return details;
    }

    values.split("\n\n").forEach(section => {
        if(!section.startsWith("Datum"))
        {
            const details = getDetails(section);
            marks[details["fach"]] = {"schnitt": details["schnitt"], "bestatigt": details["bestatigt"]};
        }
    });

    console.log(marks);

    await browser.close();
    console.log("Finished request in " + (Date.now() - start) + " ms");
}
scrapeImage();


