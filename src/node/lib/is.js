export default {
  isGeneratorFunction(fn) {
    return typeof fn === 'function' && fn.constructor && fn.constructor.name === 'GeneratorFunction';
  }
};