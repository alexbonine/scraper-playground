const fs = require('fs-extra');

const writeFile = async (filePath, data) => new Promise(async (resolve, reject) => {
  fs.writeFile(filePath, data, function(err) {
    if(err) {
        reject(err);
        return console.log(err);
    }

    console.log('The file was saved at', filePath);
    resolve();
  });
});


module.exports = writeFile;
