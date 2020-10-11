const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const writeFile = require('./writeFile');
const updateLinks = require('./updateLinks');

const IMG_SELECTOR = '.FFVAD';
const DATE_SELECTOR = '.Nzb55';
const NEXT_SELECTOR = '._6CZji';//'.coreSpriteRightChevron'; //'.SWk3c'
const SAVE_INFO_SELECTOR = '.sqdOP';
const CLOSE_SELECTOR = '.xqRnw';
const USERNAME_SELECTOR = 'header a.sqdOP';
const TITLE_SELECTOR = 'head > title';

let browser;
let page;

const getPic = ({ defaultDir, destPath, linksFile, password, username }) => async (imgUrl, altName = '', number) => {
  if (!browser) {
    browser = await puppeteer.launch({ headless: false, devtools: true, /*slowMo: 250*/ });
  }

  if (!page) {
    page = await browser.newPage();
    page.on('console', console.log);
  }

  let src, dirName, fileName;

  if (imgUrl.match(/.(gif|jpg|jpeg)$/)) {
    src = imgUrl;
    dirName = defaultDir;
    fileName = imgUrl.replace(/(.*)(.(gif|jpg|jpeg))$/, `${altName}$2`).replace('@', '');
  } else {
    const openPage = await page.goto(imgUrl, { waitUntil: 'networkidle2' });

    if (openPage.url().includes('login')) {
      await page.waitForSelector('input[name=username]');
      const usernameInput = await page.$('input[name=username]');
      if (usernameInput) {
        await usernameInput.type(username);
        const passwordInput = await page.$('input[name=password]');
        await passwordInput.type(password);
        await Promise.all([passwordInput.press('Enter'), page.waitForNavigation()]);

        const saveInfoButton = await page.$(SAVE_INFO_SELECTOR);
        if (saveInfoButton) {
          await Promise.all([saveInfoButton.click(), page.waitForNavigation()]);
        }
      }
    }

    const loginExists = await page.$(CLOSE_SELECTOR);
    if (loginExists) {
      await page.click(CLOSE_SELECTOR); // close login popup
    }

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

    const img = await page.$$eval(IMG_SELECTOR, (elArray, index) => {
      const el = elArray[index];
      return { src: el.src, alt: el.alt }; // was removing ? from src .replace(/[^.*]\?.*/, '')
    }, number ? number - 1 : 0);

    src = img.src;
    dirName = await page.$eval(USERNAME_SELECTOR, el => el.innerHTML);
    const date = await page.$eval(DATE_SELECTOR, el => el.title);
    const title = await page.$eval(TITLE_SELECTOR, el => el.innerHTML.replace(/ ?\n/, ' ').replace(/(.*)“(.*)”/mi, '$2').replace(/\/|@/gi, ''));
    const imageAlt = ''; // img.alt ? img.alt.replace('@', '') : ''; // now is description from facebook
    fileName = `${altName || imageAlt || title}${number ? `-${number}` : ''}-${date}.jpg`; //[0-9a-zA-Z\^\&\'\@\{\}\[\]\,\$\=\!\-\#\(\)\.\%\+\~\_ ]+
  }

  const viewSource = await page.goto(src);
  const dir = `${destPath}/${dirName}`;
  fs.ensureDirSync(dir);
  const filePath = `${dir}/${fileName}`;

  await writeFile(filePath, await viewSource.buffer());

  if (linksFile) {
    await updateLinks(linksFile, { dir: dirName, name: fileName, date: new Date().toISOString(), url: src });
  }

  // browser.close();
}

module.exports = getPic;
