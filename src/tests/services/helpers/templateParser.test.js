const templateParser = require('../../../rest/services/helpers/templateParser');
const {
  templateNames
} = require('../../../rest/services/helpers/templateLoader');

describe('Testing templateParser helper', () => {
  const template = '{{param}}';
  const mockedLoader = jest.fn(() => Buffer.from(template));
  const data = {
    param: 'value'
  };

  describe('Test completeTemplate method', () => {
    it('should return the template string with the completed values', async () => {
      await expect(
        templateParser.completeTemplate(
          data,
          templateNames.GENERIC,
          mockedLoader
        )
      ).resolves.toBe(data.param);
      expect(mockedLoader).toHaveBeenCalledWith(templateNames.GENERIC);
    });
  });
});
