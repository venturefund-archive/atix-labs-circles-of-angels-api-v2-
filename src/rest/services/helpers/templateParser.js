const mustache = require('mustache');

const { loadTemplate } = require('./templateLoader');
const logger = require('../../logger');

/**
 * Completes the template with the given data
 *
 * @param {object} dataToComplete data to complete template with
 * @param {string} template template name
 * @param {Promise} loader function to load the template file
 * @returns {Promise<string>} string representation of the completed template
 */
exports.completeTemplate = async (
  dataToComplete,
  template,
  loader = loadTemplate
) => {
  logger.info(
    `[TemplateParser] :: Entering completeTemplate method for ${template} template`
  );
  const templateFile = await loader(template);
  const completedTemplate = mustache.render(
    templateFile.toString(),
    dataToComplete
  );
  return completedTemplate;
};
