const logger = require('../logger');
const errors = require('../errors/exporter/ErrorExporter');
const COAError = require('../errors/COAError');

module.exports = {
  async getRoleByDescription(description) {
    logger.info('[RoleService] :: Entering getRoleByDescription method');
    const role = await this.roleDao.getRoleByDescription(description);
    if (!role) throw COAError(errors.common.ErrorGetting('role'));
    return role;
  }
};
