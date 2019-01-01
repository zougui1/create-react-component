module.exports = {
  separation: {
    components: {
      component: 'component',
      container: 'container',
      interface: 'interface',
      style: 'style',
      test: 'test'
    }
  },
  condensed: {
    components: {
      component: ['component', 'container'],
      interface: 'interface',
      style: 'style',
      test: 'test'
    }
  },
  strictseparation: {
    components: 'component',
    containers: 'container',
    interfaces: 'interface',
    styles: 'style',
    tests: 'test'
  },
}
