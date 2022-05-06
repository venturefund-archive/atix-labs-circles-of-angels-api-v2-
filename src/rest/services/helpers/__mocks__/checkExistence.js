/**
 * Looks up a record in database to check its existence.
 * Returns the object found or throws an error if not exists.
 * @param {Object} dao - Corresponding DAO for the record
 * @param {number} id - Id of the record to look up
 * @param {string} model - Corresponding model name for the record
 */
module.exports = async (dao, id, model) => ({
  country: {
    id: 1,
    name: 'Argentina'
  }
});
