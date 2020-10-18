const { writeFileSync } = require('fs-extra');
const { sortBy } = require('lodash');

const dedupeBookmarks = async (file, fileName) => {
  const regex = /<DT><A HREF="([^"]*)"[^<]*<\/A>(\r\n|\r|\n)/gi;
  let match = regex.exec(file);
  const urls = {};
  const dupes = [];

  while (match) {
    const [full, url] = [...match];

    if (urls.hasOwnProperty(url)) {
      dupes.push({ start: match.index, end: match.index + full.length, url, full });
    } else {
      urls[url] = true;
    }

    match = regex.exec(file);
  }

  const sortedDupes = sortBy(dupes, 'start');

  console.log(`Found ${sortedDupes.length} duplicates.`);

  if (sortedDupes.length > 0) {
    const newFileName = fileName.replace('.html', '_new.html');

    let newFile = file.slice(0, sortedDupes[0].start);
    for (let i = 1; i < sortedDupes.length; i += 1) {
      const start = sortedDupes[i - 1].end;
      const end = sortedDupes[i].start;

      newFile += file.slice(start, end);
    }

    writeFileSync(newFileName, newFile);
    console.log(`New file written: ${newFileName}`);
    }
};

module.exports = dedupeBookmarks;
