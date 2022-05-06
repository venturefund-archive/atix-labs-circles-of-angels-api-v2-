module.exports = {
  async findById(id) {
    return this.model.findOne({ id });
  },
  async findOneByProps(filters, populate) {
    return this.model.findOne(filters, populate);
  },
  async findAllByProps(filters, populate) {
    return this.model.find(filters, populate);
  },
  async findByTxHash(txHash) {
    return this.model.findOne({ txHash });
  },
  async findLastTxBySender(sender) {
    const [tx] = await this.model.find({
      where: { sender },
      limit: 1,
      sort: 'nonce DESC'
    });
    return tx;
  },
  async findAllBySender(sender) {
    return this.model.find({ sender });
  },
  async save(transaction) {
    return this.model.create(transaction);
  },
  async delete(id) {
    return this.model.destroyOne({ id });
  }
};
