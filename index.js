const puppeteer = require('puppeteer');
const fs = require('fs-extra');

const filePath = '/Users/bonine/.cpp';
const IMG_SELECTOR = '.FFVAD';
const USERNAME_SELECTOR = '.notranslate';
const DATE_SELECTOR = '.Nzb55';
const CLOSE_SELECTOR = '.Ls00D.z1rXJ';
const NEXT_SELECTOR = '.SWk3c.Zk-Zb.YqVDN';

async function getPic(imgUrl, number) {
  puppeteer.launch({ headless: false }).then(async (browser) => {
    const page = await browser.newPage();
    page.on('console', console.log);
    await page.goto(imgUrl, { waitUntil: 'domcontentloaded' });
    await page.click(CLOSE_SELECTOR); // close login popup

    if (number > 1) {
      for (let i = 1; i < +number; i++) {
        await page.click(NEXT_SELECTOR); // click next
      }
    } else { // add number if part of series
      const exists = await page.$(NEXT_SELECTOR);
      if (exists) {
        number = 1;
      }
    }

    const { src, alt } = await page.$eval(IMG_SELECTOR, el => ({ src: el.src.replace(/[^.*]\?.*/, ''), alt: el.alt }));
    const username = await page.$eval(USERNAME_SELECTOR, el => el.title);
    const date = await page.$eval(DATE_SELECTOR, el => el.title);
    const title = await page.$eval('head > title', el => el.innerHTML.replace(/(.*)“(.*)”/, '$2'));

    const viewSource = await page.goto(src);
    const dir = `${filePath}/${username}`;
    fs.ensureDirSync(dir);

    const filename = `${dir}/${alt || title}${number ? `-${number}` : ''}-${date}.jpg`;
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

getPic(...args);
