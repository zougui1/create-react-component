# Create-react-component
create-react-component is a CLI that create component for react

## Installation
```
$ npm install -g create-react-component
```

## commands
commands:
* init: add an npm script with its path. e.g. `"crc": "node /path/to/the/cli"`, default config: the scripts are in jsx, the styles in scss, there is no test and the structure is "separation", _4 args_
  * --tsx: pass the scripts type to tsx
  * --tests: make test file when creating a component
* c: create a stateless component
* sl: create a stateless component
* sf: create a stateful component
* rsl: create a redux stateless component
* rsf: create a redux stateful component



## pre-defined structures

### separation
```
src
  components
    MyComponent
      index.js => component
      index.container.js => if redux component
      index.scss
      index.test.js => if tests are activated
```

### condensed
```
src
  components
    MyComponent
      index.js => the component and the container in the same file (if redux component)
      index.scss
      index.test.js => if tests are activated
```

### strictSeparation
```
src
  components
    MyComponent.js
  containers
    MyComponent.js => if redux component
  styles
    MyComponent.scss
  tests
    MyComponent.test.js => if tests are activated
```

## custom structure

you can make your own structure by editing the existing one in `crc-config.json`
for example, this:
```json
"structure": {
  "components": {
    "component": ["component", "container"],
    "style": "style",
    "interface": "interface"
  },
  "tests": {
    "some": {
      "folder": {
        "test": "test"
      }
    }
  }
```
will results by this
```
src
  components
    MyComponent
      index.js => component, contains the component and the container in the same file
      index.scss
  tests
    some
      folder
        MyComponent
          index.test.js => if tests are activated
```
> note: "component", "container", "style", "interface" and "test" are all **required**
