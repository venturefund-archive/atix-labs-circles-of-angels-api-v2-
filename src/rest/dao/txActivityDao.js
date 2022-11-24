module.exports = {
  async createTxActivity(txActivity) {
    return this.model.create(txActivity);
  }
};
