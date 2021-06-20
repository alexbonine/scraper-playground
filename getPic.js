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
    browser = await puppeteer.launch({ headless: false, devtools: false, /*slowMo: 250*/ });
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
  const filePath = `${dir}/${fileName.replace(/[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/gu, '_').replace(/(\/|\\|<|>|:|\||\?|\*)/g, '-')}`;

  await writeFile(filePath, await viewSource.buffer());

  if (linksFile) {
    await updateLinks(linksFile, { dir: dirName, name: fileName, date: new Date().toISOString(), url: src });
  }

  // browser.close();
}

module.exports = getPic;
