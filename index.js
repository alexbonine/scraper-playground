const program = require('commander');
const { prompt } = require('inquirer');
const fs = require('fs-extra');
const getPicInit = require('./getPic');
const getVidInit = require('./getVid');

const configQuestion = [
  {
    type: 'input',
    name: 'file',
    message: 'Enter Config File',
  },
];

const moreQuestion = [
  {
    type: 'confirm',
    name: 'more',
    message: 'Are there more urls?',
  },
];

const questions = [
  {
    type: 'input',
    name: 'url',
    message: 'Enter URL',
    validate: (input) => {
      return input.length > 0;
    }
  },
  {
    type: 'input',
    name: 'name',
    message: 'Enter alternate name',
  },
];

const imgQuestions = [
  ...questions,
  {
    type: 'input',
    name: 'picNumber',
    message: 'Enter Pic Number',
    validate: (input) => {
      return input.length > 0 ? !isNaN(input) : true;
    },
    transformer: (input) => {
      return input.length > 0 ? parseInt(input, 10) : '';
    }
  },
];

const readFile = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    throw e;
  }
}

const promptImg = (getPic) => new Promise(async (resolve) => {
  const answers = await prompt(imgQuestions);
  await getPic(answers.url, answers.name || undefined, answers.picNumber);
  const moreAnswers = await prompt(moreQuestion);

  if (moreAnswers.more) {
    return promptImg(getPic);
  }
});

const promptVid = (getVid) => new Promise(async (resolve) => {
  const answers = await prompt(questions);
  await getVid(answers.url, answers.name || undefined);
  const moreAnswers = await prompt(moreQuestion);

  if (moreAnswers.more) {
    return promptImg(getVid);
  }
});

program
  .command('imgs <file>')
  .alias('I')
  .description('Read file of urls (either array of strings or objects with url/name)')
  .action(async (file) => {
    const config = await prompt(configQuestion);
    const getPic = getPicInit(require(config.file));

    readFile(file).forEach((entry) => {
      if (typeof entry === 'string') {
        getPic(entry);
      } else {
        getPic(entry.url, entry.name);
      }
    });
  });

program
  .command('img')
  .alias('i')
  .description('Read file of urls (either strings or objects with url/name)')
  .action(async () => {
    const config = await prompt(configQuestion); // read file name first
    const getPic = getPicInit(require(config.file));
    await promptImg(getPic);
  });

program
  .command('vids')
  .alias('V')
  .description('Read file of urls (either strings or objects with url/name)')
  .action(async () => {
    const config = await prompt(configQuestion);
    const getVid = getVidInit(require(config.file));

    readFile(file).forEach((entry) => {
      if (typeof entry === 'string') {
        getVid(entry);
      } else {
        getVid(entry.url, entry.name);
      }
    });
  });

program
  .command('vid')
  .alias('v')
  .description('Read file of urls (either strings or objects with url/name)')
  .action(async () => {
    const config = await prompt(configQuestion);
    const getVid = getVidInit(require(config.file));
    await promptImg(getVid);
  });

if (!process.argv.slice(2).length || !/[iIvV]/.test(process.argv.slice(2))) {
  program.outputHelp();
  process.exit();
}

program.parse(process.argv);
