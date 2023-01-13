const { utils } = require('ethers');
const logger = require('../rest/logger');
const COAError = require('../rest/errors/COAError');

async function getDaosAddressesForCoa(coa) {
  const daos = [];
  if (!coa) return daos;
  const daosLength = await coa.getDaosLength();
  for (let i = 0; i < daosLength; i++) {
    const daoAddress = coa.daos(i);
    daos.push(daoAddress);
  }
  return Promise.all(daos);
}

class COA {
  constructor(env) {
    this.env = env;
    this.contracts = {};
  }

  // testing methods
  async fail() {
    const coa = await this.getCOA();
    return coa.fail();
  }

  async success() {
    const coa = await this.getCOA();
    return coa.success();
  }

  async emitEvent() {
    const coa = await this.getCOA();
    return coa.emitEvent();
  }
  // testing methods

  async createMember(profile, wallet) {
    const coa = await this.getCOA();
    const connected = await coa.connect(wallet);
    await connected.createMember(profile);
  }

  async migrateMember(profile, address) {
    const coa = await this.getCOA();
    await coa.migrateMember(profile, address);
  }

  async addProjectAgreement(projectAddress, agreement) {
    const coa = await this.getCOA();
    return coa.addAgreement(projectAddress, agreement);
  }

  async createDAO(name, creator) {
    const coa = await this.getCOA();
    return coa.createDAO(name, creator);
  }

  async getProject(address) {
    return this.getContractAt('Project', address);
  }

  async getProjectById(id) {
    const coa = await this.getCOA();
    const address = await coa.projects(id);
    return this.getContractAt('Project', address);
  }

  async addClaim(project, claim, proof, valid, milestoneId, validator) {
    const registry = await this.getRegistry();
    const registryWithSigner = await registry.connect(validator);
    return registryWithSigner.addClaim(
      project,
      claim,
      proof,
      valid,
      milestoneId
    );
  }

  async getAddClaimTransaction(
    projectAddress,
    claim,
    proof,
    valid,
    milestoneId
  ) {
    const registry = await this.getRegistry();
    return this.getUnsignedTransaction(
      registry,
      'addClaim(address,bytes32,bytes32,bool,uint256)',
      [projectAddress.toLowerCase(), claim, proof, valid, milestoneId]
    );
  }

  async milestoneApproved(projectAddress, validators, claims) {
    const registry = await this.getRegistry();
    return registry.areApproved(projectAddress, validators, claims);
  }

  async approveTask(projectId, validator, taskId, proof) {
    const coa = await this.getCOA();

    const address = await coa.projects(projectId);
    const project = await this.getProject(address);
    const owner = await project.owner();

    const claim = utils.id(`${projectId}${owner}${taskId}`);

    await this.makeClaim(address, validator, claim, proof, true);
  }

  async approveTransfer(projectId, validator, transferId, proof) {
    const coa = await this.getCOA();

    const address = coa.projects(projectId);
    const claim = utils.id(`${address}${transferId}`);

    await this.makeClaim(address, validator, claim, proof, true);
  }

  async makeClaim(project, validator, claim, proof, valid) {
    const coa = await this.getCOA();
    // TODO : connect Contract instance to a signer (similar to web3's `from` argument)
    // coa.connect(validator);
    await coa.addClaim(project, claim, proof, valid);
  }

  async getProcessProposalTransaction(daoId, proposalId, memberAddress) {
    const coa = await this.getCOA();
    await this.checkDaoExistence(daoId);
    const daoAddress = await coa.daos(daoId);
    const dao = await this.getDaoContract(daoAddress, memberAddress);
    await this.checkProposalExistence(proposalId, dao);
    return this.getUnsignedTransaction(dao, 'processProposal(uint256)', [
      proposalId
    ]);
  }

  async getNewVoteTransaction(daoId, proposalId, vote, memberAddress) {
    const coa = await this.getCOA();
    await this.checkDaoExistence(daoId);
    const daoAddress = await coa.daos(daoId);
    const daoContract = await this.getDaoContract(daoAddress, memberAddress);
    await this.checkProposalExistence(proposalId, daoContract);
    return this.getUnsignedTransaction(
      daoContract,
      'submitVote(uint256,uint8)',
      [proposalId, vote]
    );
  }

  async getNewProposalTransaction(
    daoId,
    applicant,
    proposalType,
    description,
    memberAddress
  ) {
    const coa = await this.getCOA();
    await this.checkDaoExistence(daoId);
    const daoAddress = await coa.daos(daoId);
    const daoContract = await this.getDaoContract(daoAddress, memberAddress);
    return this.getUnsignedTransaction(
      daoContract,
      'submitProposal(address,uint8,string)',
      [applicant, proposalType, description]
    );
  }

  // noinspection JSUnusedGlobalSymbols
  async sendNewTransaction(signedTransaction) {
    try {
      return this.env.ethers.provider.sendTransaction(signedTransaction);
    } catch (error) {
      logger.info(`[ActivityService] :: Blockchain error :: ${error}`);
      throw new COAError(error);
    }
  }

  async getMember(address) {
    const coa = await this.getCOA();
    return coa.members(address);
  }

  async getContract(name, signer) {
    return this.env.deployments.getContractFactory(name, signer);
  }

  async getContractAt(name, address, signer) {
    const factory = await this.getContract(name, signer);
    return factory.attach(address);
  }

  async getDaoContract(address, signer) {
    return this.getContractAt('DAO', address, signer);
  }

  async submitProposalVote(daoId, proposalId, vote, signer) {
    const coa = await this.getCOA();
    await this.checkDaoExistence(daoId);
    const daoAddress = await coa.daos(daoId);
    const dao = await this.getDaoContract(daoAddress, signer);
    await this.checkProposalExistence(proposalId, dao);
    await dao.submitVote(proposalId, vote);
  }

  async submitProposal(daoId, type, description, applicantAddress, signer) {
    const coa = await this.getCOA();
    await this.checkDaoExistence(daoId);
    const daoAddress = await coa.daos(daoId);
    const dao = await this.getDaoContract(daoAddress, signer);
    await dao.submitProposal(applicantAddress, type, description);
  }

  async processProposal(daoId, proposalId, signer) {
    const coa = await this.getCOA();
    await this.checkDaoExistence(daoId);
    const daoAddress = await coa.daos(daoId);
    const dao = await this.getDaoContract(daoAddress, signer);
    await this.checkProposalExistence(proposalId, dao);
    await dao.processProposal(proposalId);
  }

  async getAllProposalsByDaoId(daoId, signer) {
    const coa = await this.getCOA();
    await this.checkDaoExistence(daoId);
    const daoAddress = await coa.daos(daoId);
    const dao = await this.getDaoContract(daoAddress, signer);
    const proposalsLength = await dao.getProposalQueueLength();
    const proposals = [];
    for (let i = 0; i < proposalsLength; i++) {
      proposals.push(dao.proposalQueue(i));
    }
    return Promise.all(proposals);
  }

  async getCreationTime(daoId, signer) {
    const coa = await this.getCOA();
    await this.checkDaoExistence(daoId);
    const daoAddress = await coa.daos(daoId);
    const dao = await this.getDaoContract(daoAddress, signer);
    return dao.creationTime();
  }

  async getCurrentPeriod(daoId, signer) {
    const coa = await this.getCOA();
    await this.checkDaoExistence(daoId);
    const daoAddress = await coa.daos(daoId);
    const dao = await this.getDaoContract(daoAddress, signer);
    return dao.getCurrentPeriod();
  }

  async getDaoMember(daoId, memberAddress, signer) {
    const coa = await this.getCOA();
    await this.checkDaoExistence(daoId);
    const daoAddress = await coa.daos(daoId);
    const dao = await this.getDaoContract(daoAddress, signer);
    return dao.members(memberAddress);
  }

  async getDaos() {
    const coa = await this.getCOA();
    const daoAddresses = await getDaosAddressesForCoa(coa);
    return Promise.all(
      daoAddresses.map(daoAddress => this.getDaoContract(daoAddress))
    );
  }

  async getDaosLength() {
    const coa = await this.getCOA();
    return coa.getDaosLength();
  }

  /**
   * @return all projects in COA
   */
  async getProjects() {
    const projects = [];
    const coa = await this.getCOA();
    if (!coa) return projects;
    const daosLength = await this.getProjectsLength();
    for (let i = 0; i < daosLength; i++) {
      const projectAddress = coa.projects(i);
      const project = this.getProject(projectAddress);
      projects.push(project);
    }
    return Promise.all(projects);
  }

  /**
   * @return Length of projects
   */
  async getProjectsLength() {
    const coa = await this.getCOA();
    return coa.getProjectsLength();
  }

  async getDaoPeriodLengths(daoId, signer) {
    const coa = await this.getCOA();
    await this.checkDaoExistence(daoId);
    const daoAddress = await coa.daos(daoId);
    const dao = await this.getDaoContract(daoAddress, signer);
    const periodDuration = await dao.periodDuration();
    const votingPeriodLength = await dao.votingPeriodLength();
    const gracePeriodLength = await dao.gracePeriodLength();
    const processingPeriodLength = await dao.processingPeriodLength();
    return {
      periodDuration,
      votingPeriodLength,
      gracePeriodLength,
      processingPeriodLength
    };
  }

  async getOpenProposalsFromDao(daoId, signer) {
    const proposals = await this.getAllProposalsByDaoId(daoId, signer);
    return proposals.filter(
      proposal => !proposal.processed && !proposal.votingPeriodExpired
    ).length;
  }

  async getProposalQueueLength(dao) {
    return dao.getProposalQueueLength();
  }

  async checkDaoExistence(daoId) {
    if (daoId >= (await this.getDaosLength()))
      throw new Error('DAO does not exist');
  }

  async checkProposalExistence(proposalId, dao) {
    if (proposalId >= (await this.getProposalQueueLength(dao)).toNumber())
      throw new Error('Proposal does not exist');
  }

  async votingPeriodExpired(daoId, proposalId) {
    const coa = await this.getCOA();
    await this.checkDaoExistence(daoId);
    const daoAddress = await coa.daos(daoId);
    const dao = await this.getDaoContract(daoAddress);
    await this.checkProposalExistence(proposalId, dao);
    const proposal = await dao.proposalQueue(proposalId);
    const startingPeriod = Number(proposal.startingPeriod);
    return dao.hasVotingPeriodExpired(startingPeriod);
  }

  // Note: the contract was renamed to ProjectRegistry, but this function name wasn't updated (for now) for compatibility purposes
  async getCOA() {
    if (this.contracts.coa === undefined) {
      this.contracts.coa = await this.env.deployments.getLastDeployedContract(
        'ProjectsRegistry'
      );
    }

    return this.contracts.coa;
  }

  async getRegistry() {
    if (this.contracts.registry === undefined) {
      this.contracts.registry = await this.env.deployments.getLastDeployedContract(
        'ClaimsRegistry'
      );
    }

    return this.contracts.registry;
  }

  async getWhitelist() {
    if (this.contracts.whitelist === undefined) {
      this.contracts.whitelist = await this.env.deployments.getLastDeployedContract(
        'UsersWhitelist'
      );
    }

    return this.contracts.whitelist;
  }

  async getProxyAdmin() {
    if (this.contracts.proxyAdmin === undefined) {
      this.contracts.proxyAdmin = await this.env.deployments.getLastDeployedContract(
        'ProxyAdmin'
      );
    }

    return this.contracts.proxyAdmin;
  }

  async getProvider() {
    return this.env.deployments.getProvider();
  }

  async getSigner(account) {
    return this.env.deployments.getSigner(account);
  }

  isDeployed(state, chainId, name) {
    return (
      state[chainId] !== undefined &&
      state[chainId][name] !== undefined &&
      state[chainId][name].length > 0
    );
  }

  clearContracts() {
    this.contracts = {};
  }

  /**
   * Creates an unsigned transaction.
   * @param {ethers.Contract} contract
   * @param {String} functionName
   * @param {Array} args
   */
  async getUnsignedTransaction(contract, functionName, args) {
    const utx = await contract.populateTransaction[functionName](...args);
    utx.gasLimit = Number(await contract.estimateGas[functionName](...args));
    utx.gasPrice = Number(await this.env.ethers.provider.getGasPrice());
    return utx;
  }

  /**
   * Returns the transaction count of an address
   * @param {String} address
   */
  async getTransactionCount(address) {
    return this.env.ethers.provider.getTransactionCount(address);
  }

  async getTransactionResponse(txHash) {
    return this.env.ethers.provider.getTransaction(txHash);
  }

  async getTransactionReceipt(txHash) {
    return this.env.ethers.provider.getTransactionReceipt(txHash);
  }

  /**
   * Returns the block at blockHashOrNumber
   * or the last one if none specified
   *
   * @param {string | number} blockHashOrNumber
   */
  async getBlock(blockHashOrNumber) {
    return this.env.ethers.provider.getBlock(blockHashOrNumber);
  }

  /**
   * @dev get all the recipient contracts in order to verify balances, founding, etc.
   *
   * @return object with the arrays of recipient contracts for each contract type
   */
  async getAllRecipientContracts() {
    const coa =
      (await this.getCOA()) !== undefined ? [await this.getCOA()] : [];
    const daos = await this.getDaos();
    const claimRegistry =
      (await this.getRegistry()) !== undefined
        ? [await this.getRegistry()]
        : [];
    return {
      coa,
      claimRegistry,
      daos
    };
  }

  /**
   * @param projectId
   * @param metadataHash hash of the uploaded file
   *
   */
  async createProject({ projectId, metadataHash }) {
    const coa = await this.getCOA();
    return coa.createProject(projectId, metadataHash);
  }

  /**
   * @param projectId id of the project
   * @param claimHash hash of the projectId + activityId
   * @param proofHash hash of the uploaded file
   * @param activityId id of the activity
   * @param proposerEmail email of the user that propose claim
   * @param authorizationSignature signature of all parameters mentioned above
   *
   */
  async proposeClaim({
    projectId,
    claimHash,
    proofHash,
    activityId,
    proposerEmail,
    authorizationSignature
  }) {
    const registry = await this.getRegistry();
    return registry.proposeClaim(
      projectId,
      claimHash,
      proofHash,
      activityId,
      proposerEmail,
      authorizationSignature
    );
  }

  /**
   * @param projectId id of the project
   * @param claimHash hash of the projectId + activityId
   * @param proofHash hash of the uploaded file
   * @param proposerAddress address of the user that propose claim
   * @param auditorEmail email of the claim auditor
   * @param approved boolean to approve or reject claim
   * @param authorizationSignature signature of all parameters mentioned above
   *
   */
  async submitClaimAuditResult({
    projectId,
    claimHash,
    proofHash,
    proposerAddress,
    auditorEmail,
    approved,
    authorizationSignature
  }) {
    const registry = await this.getRegistry();
    return registry.submitClaimAuditResult(
      projectId,
      claimHash,
      proofHash,
      proposerAddress,
      auditorEmail,
      approved,
      authorizationSignature
    );
  }
}

module.exports = {
  COA,
  getDaosAddressesForCoa
};
