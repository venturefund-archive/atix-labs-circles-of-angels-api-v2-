// TODO: this should be deleted along with the table and the model
module.exports = {
  async findAllByProps(filters, populate) {
    return this.model.find(filters, populate);
  }
};
