const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const writeFile = require('./writeFile');
const updateLinks = require('./updateLinks');

// const IMG_SELECTOR = '.FFVAD';
// const USERNAME_SELECTOR = '.notranslate';
// const DATE_SELECTOR = '.Nzb55';
// const CLOSE_SELECTOR = '.Ls00D.z1rXJ';
// const NEXT_SELECTOR = '.SWk3c.Zk-Zb.YqVDN';

const getVid = ({ defaultDir, destPath, linksFile }) => (imgUrl, altName = '', number) => {
  // return puppeteer.launch().then(async (browser) => {
  //   const page = await browser.newPage();
  //   page.on('console', console.log);
  //   let src, dirName, fileName; 
    
  //   if (imgUrl.match(/.(gif|jpg|jpeg)$/)) {
  //     src = imgUrl;
  //     dirName = defaultDir;
  //     fileName = imgUrl.replace(/(.*)(.(gif|jpg|jpeg))$/, `${altName}$2`);
  //   } else {
  //     await page.goto(imgUrl, { waitUntil: 'domcontentloaded' });
  //     await page.click(CLOSE_SELECTOR); // close login popup

  //     if (number > 1) {
  //       for (let i = 1; i < +number; i++) {
  //         await page.click(NEXT_SELECTOR); // click next
  //       }
  //     } else { // add number if part of series
  //       const exists = await page.$(NEXT_SELECTOR);
  //       if (exists) {
  //         number = 1;
  //       }
  //     }

  //     const img = await page.$eval(IMG_SELECTOR, el => ({ src: el.src.replace(/[^.*]\?.*/, ''), alt: el.alt }));
  //     src = img.src;
  //     dirName = await page.$eval(USERNAME_SELECTOR, el => el.title);
  //     const date = await page.$eval(DATE_SELECTOR, el => el.title);
  //     const title = await page.$eval('head > title', el => el.innerHTML.replace(/ ?\n/, ' ').replace(/(.*)“(.*)”/mi, '$2'));
  //     fileName = `${altName || img.alt || title}${number ? `-${number}` : ''}-${date}.jpg`
  //   }

  //   const viewSource = await page.goto(src);
  //   const dir = `${destPath}/${dirName}`;
  //   fs.ensureDirSync(dir);
  //   const filePath = `${dir}/${fileName}`;

  //   await writeFile(filePath, await viewSource.buffer());
    

  //   if (linksFile) {
  //     await updateLinks(linksFile, { dir: dirName, name: fileName, date: new Date().toISOString(), url: src });
  //   }

  //   browser.close();
  // });
}

module.exports = getVid;
