const fs = require('fs');
const { pascalCasify, getPreviousDir } = require('./utils');

const lowerWords = [
  'src',
  'components',
  'containers',
  'interfaces',
  'styles',
  'tests'
];

const createFolder = (componentPath, path) => {
  let pathParts = componentPath.split(/[/\\]/);
  let componentName = pathParts[pathParts.length - 1];
  componentName = pascalCasify(componentName);
  const previousDir = getPreviousDir(path || componentPath);
  path = path || `${previousDir}/${componentName}`;
  lowerWords.forEach(word => path = path.replace(new RegExp(word, 'i'), word.toLowerCase()));

  return new Promise((resolve, reject) => {
    fs.exists(previousDir, exists => {
      if(!exists) {
        createFolder(componentPath, previousDir)
          .then(() => mkdir(path).then(resolve).catch(reject))
          .catch(reject);
        } else mkdir(path).then(resolve).catch(reject);
    })
  })
}

const mkdir = path => new Promise((resolve, reject) => {
  fs.mkdir(path, err => {
    if(err) return reject(err);
    resolve();
  })
})

module.exports = createFolder;
