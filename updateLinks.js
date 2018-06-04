const fs = require('fs-extra');

const updateLinks = async (linksFile, obj) => {
  const links = require(linksFile);
  links.list.push(obj);

  return new Promise((resolve) => {
    fs.writeFileSync(linksFile, JSON.stringify(links, null, 2));
    resolve();
  });
}

module.exports = updateLinks;
