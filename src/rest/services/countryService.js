const logger = require('../logger');
const checkExistence = require('./helpers/checkExistence');

module.exports = {
  async getAll(props) {
    logger.info('[CountryService] :: Entering getAll method');
    const filters = props && props.filters ? props.filters : {};
    const countries = await this.countryDao.findAllByProps(filters);
    return countries.map(({ id, name }) => ({ id, name }));
  },
  async getCountryById(id) {
    logger.info('[CountryService] :: Entering getCountryById method');
    const country = await checkExistence(this.countryDao, id, 'country');
    logger.info(`[CountryService] :: Country id ${country.id} found`);
    return country;
  },
};
