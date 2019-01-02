const fs = require('fs');
const { pascalCasify, getPreviousDir, createFile, getConfig, getConfigFromCommand } = require('./utils');
const createFolder = require('./create-folder');

// all the pre-defined file type
const allFilesType = ['component', 'style', 'container', 'interface', 'test'];

const inArray = (needle, haystack = []) => {
  var length = haystack.length;
  for (var i = 0; i < length; i++) {
    if(haystack[i].toLowerCase() === needle.toLowerCase()) return true;
  }
  return false;
}

// the way it has been made, doesn't work in asynchrone with return statement, so it return a promise
// find the a file position in the structure
const findFilePosition = (structure, search, parents = []) => new Promise((resolve, reject) => {
  for (const key in structure) {
    if (structure.hasOwnProperty(key)) {
      const element = structure[key];
      const currentPositions = {
        search,
        folder: parents[parents.length - 1] || key,
        parents,
      };
      if(element.constructor.name === 'Object') findFilePosition(element, search, [...parents, key]).then(resolve).catch(reject);
      else if(Array.isArray(element)) element.forEach(elt => {
        if(elt === search) return resolve({ ...currentPositions, contains: element });
      });
      else if(element === search) return resolve(currentPositions);
    }
  }
  // 500 ms is enough to find a value if it exist
  setTimeout(reject, 500, `${search} not found in the config's structure`);
});

// we stock the files position in an object and return it if there's the expected amount of data
const tempFilesPositionStore = expectingFilesPositionNumber => {
  let filesPositionNumber = 0;
  const filesPosition = {};
  return {
    addFilePosition: filePosition => {
      ++filesPositionNumber;
      filesPosition[filePosition.search] = filePosition;
      return expectingFilesPositionNumber === filesPositionNumber;
    },
    getFilesPosition: () => filesPosition
  }
}

// find all the files position
const findAllFilesPosition = (structure, filesTypes, customFiles) => new Promise((resolve, reject) => {
  filesTypes = filesTypes || allFilesType;
  filesTypes = filesTypes.concat(customFiles);
  const store = tempFilesPositionStore(filesTypes.length);
  filesTypes.forEach(fileType => {
    findFilePosition(structure, fileType)
      .then(filePosition => {
        if(store.addFilePosition(filePosition)) return resolve(store.getFilesPosition());
      })
      .catch(reject);
  });
});

const isConfigValid = (config, reject) => {
  const { scriptsType, tests, style, structure } = config;
  let errors = [];
  if(config.constructor.name !== 'Object') errors.push('The CLI must be initialized');
  if(!scriptsType || !/(j|t)sx/.test(scriptsType)) {
    errors.push('The rule "scriptsType" is wrong, it must contains: "tsx" OR "jsx"');
  }
  if(tests === undefined || tests === null || typeof tests !== 'boolean') {
    errors.push('The rule "tests" is wrong, it must contains true OR false');
  }
  if(!style || typeof style !== 'string') {
    errors.push('The rule "style" is wrong, it must contains a non-empty string');
  }
  if(!structure || structure.constructor.name !== 'Object') {
    errors.push('The rule "structure" is wrong, it must be a literal object');
  }
  if(errors.length > 0) reject(errors);
}

// determines which files to create
module.exports = (component, command) => new Promise((resolve, reject) => {
  const configCLI = getConfigFromCommand(command);
  let files = ['style', 'component']; // this contains all the files type that are going to be created
  const config = getConfig();
  isConfigValid(config, reject); // if the config is invalid we do not want to continue
  const customFiles = Array.isArray(config.customFiles) ? config.customFiles : [];
  findAllFilesPosition(configCLI.structure || config.structure, null, customFiles)
    .then(filesPosition => {
      component.name = component.name.replace(/\\/g, '/');
      component.name = /src\/components/.test(component.name)
        ? component.name
        : `src/components/${component.name}`;

      if(configCLI.tests) files.push('test');
      else if(config.tests === true) files.push('test');
      // contains is defined only if the value is an array (e.g. "component": ["component", "container"])
      if(!filesPosition.container.contains) files.push('container');
      if(configCLI.scriptsType !== 'jsx' && config.scriptsType === 'tsx' && !filesPosition.interface.contains) files.push('interface');
      files = files.concat(customFiles);

      const options = {
        componentType: component.type,
        config,
        filesPosition,
        configCLI,
      };
      creation(component.name, options, files).then(resolve).catch(reject);
    })
    .catch(reject);
});

// create all the files specified in "files"
const creation = (componentName, options, files) => new Promise((resolve, reject) => {
  if(files.length === 0) return resolve();
  options.fileType = files[0];
  files.shift();
  createComponent(componentName, options).then(() => {
    creation(componentName, options, files).then(resolve).catch(reject);
  }).catch(reject);
});

// create one file
const createComponent = (path, options) => {
  const { fileType, filesPosition, config, configCLI } = options;
  path = correctPath(path, options); // find the correct path where the file will be created
  let pathParts = path.split(/[/\\]/);
  const componentName = pascalCasify(/index/i.test(pathParts[pathParts.length - 1])
    ? pathParts[pathParts.length - 2]
    : pathParts[pathParts.length - 1]);

  const tempPath = `${getPreviousDir(__dirname, true)}/templates`;
  const templatePath = getTemplatePath(options); // find the correct path to the template that will be used for the file
  let ext = getExt(options); // find the correct extension
  let finalTemplatePath = `${tempPath}/${templatePath}`;
  if(fileType !== 'style') finalTemplatePath += `.${ext}`; // the style's template doesn't have an extension
  const previousDir = getPreviousDir(path);
  pathParts[pathParts.length - 1] = componentName;
  const creationPath = pathParts.join('/');

  const customTemplate = config.templates[fileType];
  const customTemplatesPath = config.templatesPath || '.';
  if(customTemplate) finalTemplatePath = `${process.cwd()}/${customTemplatesPath}/${customTemplate}`;
  if(!inArray(fileType, allFilesType) && !config.templates[fileType]) finalTemplatePath = '';
  const createFileOptions = {
    creationPath: `${creationPath}.${ext}`,
    readFilePath: finalTemplatePath,
    fileType,
    componentName,
    config,
    filesPosition,
    configCLI,
  };
  return new Promise((resolve, reject) => {
    fs.exists(previousDir, exists => {
      if(!exists) createFolder(previousDir) // if the folder where the file shall be created doesn't exist, we create it then create the file once it's done
        .then(() => createFile(createFileOptions).then(resolve).catch(reject))
        .catch(reject);
      else createFile(createFileOptions).then(resolve).catch(reject);
    });
  });
}

// get the correct path where the files will be created
const correctPath = (path, options) => {
  const { fileType, filesPosition } = options;
  let correctPath = path;

  const filePosition = filesPosition[fileType];
  // filePosition doesn't necessary have parents, there's parents if there's 1+ nested structure
  correctPath = correctPath.replace('components', filePosition.parents.join('/') || filePosition.folder);
  if(filesPosition[fileType].parents.length > 0) correctPath += '/index';
  return correctPath;
}

// get the templates path
const getTemplatePath = options => {
  let { componentType, fileType, filesPosition, config, configCLI } = options;
  const { scriptsType } = config;

  let path;
  if(fileType === 'style') return 'style';
  path = configCLI.scriptsType || scriptsType;
  if(fileType === 'test') return `${path}/test`;

  const { contains } = filesPosition[fileType];
  if(inArray('component', contains) && inArray('container', contains) && inArray('interface', contains)) path += '/all';
  else if(configCLI.scriptsType === 'tsx' || scriptsType === 'jsx' || fileType === 'component') path += '/components';
  else if(fileType === 'interface') path += '/interfaces';
  else if(fileType === 'container') return `${path}/container`;

  componentType.substring(1);
  path += `/${componentType}-component`;
  return path;
}


// get the files extension
const getExt = options => {
  const { config, fileType, configCLI } = options;
  const { scriptsType, style } = config;

  let ext;
  if(fileType === 'style') ext = configCLI.style || style;
  else if(configCLI.scriptsType === 'jsx' || scriptsType === 'jsx') ext = 'js';
  else ext = 'tsx';

  return ext;
}
