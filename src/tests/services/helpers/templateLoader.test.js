const errors = require('../../../rest/errors/exporter/ErrorExporter');
const templateLoader = require('../../../rest/services/helpers/templateLoader');

const { templateNames, getTemplatePath } = templateLoader;

describe('Testing templateLoader helper', () => {
  const mockedRead = jest.fn();

  describe('Test loadTemplate method', () => {
    it('should return the file for the indicated template', async () => {
      await expect(
        templateLoader.loadTemplate(templateNames.GENERIC, mockedRead)
      ).resolves.toBeUndefined();
      expect(mockedRead).toHaveBeenCalledWith(
        getTemplatePath(templateNames.GENERIC)
      );
    });
    it('should throw an error if the template does not exist', async () => {
      await expect(templateLoader.loadTemplate('', mockedRead)).rejects.toThrow(
        errors.mail.TemplateNotFound
      );
    });
  });
});
