create-react-component is a CLI that create component for react

commands:
* init: add an npm script with its path. e.g. `"crc": "node /path/to/the/cli"`, default config: the scripts are in jsx, the styles in scss, there is no test and the structure is "separation", _4 args_
  * --tsx: pass the scripts type to tsx
  * --tests: make test file when creating a component
* c: create a stateless component
* sl: create a stateless component
* sf: create a stateful component
* rsl: create a redux stateless component (equal to "sl" if the scripts are in tsx)
* rsf: create a redux stateful component (equal to "sf" if the scripts are in tsx)

`npm install -g create-react-component`

# pre-defined structures

## separation
```
src
  components
    MyComponent
      index.js => component
      index.container.js => if redux component
      index.scss
      index.test.js => if tests are activated
```

## condensed
```
src
  components
    MyComponent
      index.js => the component and the container in the same file (if redux component)
      index.scss
      index.test.js => if tests are activated
```

## strictSeparation
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

# custom structure

you can make your own structure by editing the existing one in `crc-config.json`
for example, this:
```json
"structure": {
  "components": {
    "component": ["component", "container"],
    "style": "style",
    "interface": "interface" // is used for tsx projects
  },
  "tests": "test"
}
```
will results by this
```
src
  components
    MyComponent
      index.js => component
      index.scss
  tests
    MyComponent
      index.test.js => if tests are activated
```
> note: "component", "container" and "style" are **required** in the structure, "test" is required if you use testing files and "interface" is required if your project is in tsx
