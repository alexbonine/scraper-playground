const puppeteer = require('puppeteer');
const fs = require('fs-extra');

const filePath = '/Users/bonine/.cpp';
const IMG_CLASS = 'FFVAD';
const USERNAME_CLASS = 'notranslate';
const DATE_CLASS = 'Nzb55';

async function getPic(imgUrl) {
  puppeteer.launch().then(async (browser) => {
    const page = await browser.newPage();
    page.on('console', console.log);
    await page.goto(imgUrl, { waitUntil: 'domcontentloaded' });

    const { src, alt } = await page.$eval(`.${IMG_CLASS}`, el => ({ src: el.src.replace(/[^.*]\?.*/, ''), alt: el.alt }));
    const username = await page.$eval(`.${USERNAME_CLASS}`, el => el.title);
    const date = await page.$eval(`.${DATE_CLASS}`, el => el.title);
    const title = await page.$eval('head > title', el => el.innerHTML.replace(/(.*)“(.*)”/, '$2'));

    const viewSource = await page.goto(src);
    const dir = `${filePath}/${username}`;
    fs.ensureDirSync(dir);

    const filename = `${dir}/${alt || title}-${date}.jpg`;
    fs.writeFile(filename, await viewSource.buffer(), function(err) {
        if(err) {
            return console.log(err);
        }

        console.log('The file was saved at', filename);
    });

    browser.close();
  });
}

const args = [...process.argv].slice(2);

getPic(args[0]);
