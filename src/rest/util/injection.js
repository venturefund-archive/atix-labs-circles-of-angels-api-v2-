function getDescriptors(values, mockable = false) {
  // map property descriptors
  return Object.entries(values).reduce(
    (acc, [name, value]) =>
      Object.assign(acc, {
        [name]: {
          value,
          configurable: mockable
        }
      }),
    {}
  );
}

module.exports = {
  injectMocks(instance, mocks) {
    Object.defineProperties(instance, getDescriptors(mocks, true));
  },
  injectDependencies(instance, dependencies) {
    Object.defineProperties(instance, getDescriptors(dependencies));
  }
};
