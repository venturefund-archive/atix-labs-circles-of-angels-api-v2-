/* eslint-disable no-console */
// const { describe, it, before, beforeEach, after } = global;
const { describe, it, before, after } = global;
const { run, deployments, ethers, web3 } = require('@nomiclabs/buidler');
const { BigNumber } = require('@ethersproject/bignumber');
const {
  deployRelayHub,
  runRelayer,
  fundRecipient,
  balance
} = require('@openzeppelin/gsn-helpers');
const { testConfig } = require('config');
const { GSNDevProvider } = require('@openzeppelin/gsn-provider');

const chai = require('chai');
const { solidity } = require('ethereum-waffle');

chai.use(solidity);

const PROVIDER_URL = ethers.provider.connection.url;
const fundValue = '1000000000000000000';

contract('Withdraw Gsn funded contracts balance', accounts => {
  const [
    creator,
    userRelayer,
    ownerAddress,
    relayerAddress,
    signerAddress,
    other
  ] = accounts;
  let coa;
  let claimsRegistry;
  let superDaoAddress;
  let daoAddress;
  let whitelist;
  let subprocess;
  let hubAddress;

  before('==>> ', async function b() {
    hubAddress = await deployRelayHub(web3, {
      from: userRelayer
    });
    subprocess = await runRelayer({ quiet: true, relayHubAddress: hubAddress });

    this.timeout(testConfig.contractTestTimeoutMilliseconds);

    await run('deploy', { resetStates: true });
    coa = await deployments.getLastDeployedContract('COA');
    claimsRegistry = await deployments.getLastDeployedContract(
      'ClaimsRegistry'
    );

    whitelist = await deployments.getLastDeployedContract('UsersWhitelist');
    await coa.setWhitelist(whitelist.address);

    await fundRecipient(web3, {
      recipient: coa.address,
      amount: fundValue,
      relayHubAddress: hubAddress
    });

    await fundRecipient(web3, {
      recipient: claimsRegistry.address,
      amount: fundValue,
      relayHubAddress: hubAddress
    });

    superDaoAddress = await coa.daos(0);
    await fundRecipient(web3, {
      recipient: superDaoAddress,
      amount: fundValue,
      relayHubAddress: hubAddress
    });
  });

  after('finish process', async function a() {
    if (subprocess) subprocess.kill();
  });

  describe('With GSN disabled', () => {
    let gsnDevProvider;
    let provider;
    let project;

    before(async () => {
      gsnDevProvider = new GSNDevProvider(PROVIDER_URL, {
        ownerAddress,
        relayerAddress,
        useGSN: false
      });
      provider = new ethers.providers.Web3Provider(gsnDevProvider);
      project = {
        id: 1,
        name: 'a good project'
      };
    });

    it('executes coa TX from a user spending his founds (proof gsn off)', async () => {
      await whitelist.addUser(signerAddress);
      const gsnCoaOff = await deployments.getContractInstance(
        'COA',
        coa.address,
        provider.getSigner(signerAddress)
      );
      const oldBalance = await gsnCoaOff.provider.getBalance(signerAddress);
      await gsnCoaOff.createProject(project.id, project.name);
      const newBalance = await gsnCoaOff.provider.getBalance(signerAddress);
      chai.assert.isTrue(newBalance.lt(oldBalance));
    });

    describe('WhitdrawDeposit should ==> ', () => {
      const getBalances = async (
        _hubAddress,
        _relayerAddress,
        _contractAddress,
        _userAddress
      ) => {
        const balances = {
          hub: BigNumber.from(await coa.provider.getBalance(_hubAddress)),
          relayer: BigNumber.from(
            await coa.provider.getBalance(_relayerAddress)
          ),
          contract: BigNumber.from(
            await balance(web3, {
              recipient: _contractAddress
            })
          ),
          user: BigNumber.from(await coa.provider.getBalance(_userAddress))
        };

        return balances;
      };

      describe('On [Coa] Contract ==> ', () => {
        it('Return the amount to the caller when owner calls', async () => {
          const oldBalances = await getBalances(
            hubAddress,
            relayerAddress,
            coa.address,
            creator
          );

          const withdrawAmount = BigNumber.from('100000000000000000');
          const resultTx = await coa.withdrawDeposits(withdrawAmount, creator);

          const newBalances = await getBalances(
            hubAddress,
            relayerAddress,
            coa.address,
            creator
          );

          chai.assert.isTrue(
            withdrawAmount.eq(oldBalances.hub.sub(newBalances.hub))
          );
          chai.assert.isTrue(newBalances.relayer.eq(oldBalances.relayer));
          chai.assert.isTrue(
            withdrawAmount.eq(oldBalances.contract.sub(newBalances.contract))
          );

          const receiptTx = await web3.eth.getTransactionReceipt(resultTx.hash);
          const gasUsed = BigNumber.from(receiptTx.gasUsed);
          const gasPrice = await web3.eth.getGasPrice();
          const gasAmountEth = gasUsed.mul(gasPrice);
          const qtyAddedToCreatorBalance = withdrawAmount.sub(gasAmountEth);

          chai.assert.isTrue(
            oldBalances.user.add(qtyAddedToCreatorBalance).eq(newBalances.user)
          );
        });

        it('Fail when the amount is not bigger than zero', async () => {
          const withdrawAmount = BigNumber.from('0');
          await chai
            .expect(coa.withdrawDeposits(withdrawAmount, creator))
            .to.be.revertedWith('Amount cannot be ZERO');
        });

        it('Fail when the address is invalid', async () => {
          const withdrawAmount = BigNumber.from('10000000000');
          await chai.expect(coa.withdrawDeposits(withdrawAmount, '0x0')).to.be
            .reverted;
        });

        it('Fail when the amount is bigger than balance', async () => {
          const withdrawAmount = BigNumber.from('100000000000000000000');
          await chai.expect(coa.withdrawDeposits(withdrawAmount, creator)).to.be
            .reverted;
        });
      });

      describe('On [ClaimRegistry] Contract ==> ', () => {
        it('Return the amount to the caller when owner calls', async () => {
          const oldBalances = await getBalances(
            hubAddress,
            relayerAddress,
            claimsRegistry.address,
            creator
          );

          const withdrawAmount = BigNumber.from('100000000000000000');
          const resultTx = await claimsRegistry.withdrawDeposits(
            withdrawAmount,
            creator
          );

          const newBalances = await getBalances(
            hubAddress,
            relayerAddress,
            claimsRegistry.address,
            creator
          );

          chai.assert.isTrue(
            withdrawAmount.eq(oldBalances.hub.sub(newBalances.hub))
          );
          chai.assert.isTrue(newBalances.relayer.eq(oldBalances.relayer));
          chai.assert.isTrue(
            withdrawAmount.eq(oldBalances.contract.sub(newBalances.contract))
          );

          const receiptTx = await web3.eth.getTransactionReceipt(resultTx.hash);
          const gasUsed = BigNumber.from(receiptTx.gasUsed);
          const gasPrice = await web3.eth.getGasPrice();
          const gasAmountEth = gasUsed.mul(gasPrice);
          const qtyAddedToCreatorBalance = withdrawAmount.sub(gasAmountEth);

          chai.assert.isTrue(
            oldBalances.user.add(qtyAddedToCreatorBalance).eq(newBalances.user)
          );
        });

        it('Fail when the amount is not bigger than zero', async () => {
          const withdrawAmount = BigNumber.from('0');
          await chai
            .expect(claimsRegistry.withdrawDeposits(withdrawAmount, creator))
            .to.be.revertedWith('Amount cannot be ZERO');
        });

        it('Fail when the address is invalid', async () => {
          const withdrawAmount = BigNumber.from('10000000000');
          await chai.expect(
            claimsRegistry.withdrawDeposits(withdrawAmount, '0x0')
          ).to.be.reverted;
        });

        it('Fail when the amount is bigger than balance', async () => {
          const withdrawAmount = BigNumber.from('100000000000000000000');
          await chai.expect(
            claimsRegistry.withdrawDeposits(withdrawAmount, creator)
          ).to.be.reverted;
        });
      });

      describe('On [SuperDao] Contract ==> ', () => {
        it('Return the amount to the caller when owner calls', async () => {
          const oldBalances = await getBalances(
            hubAddress,
            relayerAddress,
            superDaoAddress,
            creator
          );

          const withdrawAmount = BigNumber.from('100000000000000000');
          const resultTx = await coa.withdrawDaoDeposits(
            withdrawAmount,
            creator,
            superDaoAddress
          );

          const newBalances = await getBalances(
            hubAddress,
            relayerAddress,
            superDaoAddress,
            creator
          );

          chai.assert.isTrue(
            withdrawAmount.eq(oldBalances.hub.sub(newBalances.hub))
          );
          chai.assert.isTrue(newBalances.relayer.eq(oldBalances.relayer));
          chai.assert.isTrue(
            withdrawAmount.eq(oldBalances.contract.sub(newBalances.contract))
          );

          const receiptTx = await web3.eth.getTransactionReceipt(resultTx.hash);
          const gasUsed = BigNumber.from(receiptTx.gasUsed);
          const gasPrice = await web3.eth.getGasPrice();
          const gasAmountEth = gasUsed.mul(gasPrice);
          const qtyAddedToCreatorBalance = withdrawAmount.sub(gasAmountEth);

          chai.assert.isTrue(
            oldBalances.user.add(qtyAddedToCreatorBalance).eq(newBalances.user)
          );
        });

        it('Fail when the amount is not bigger than zero', async () => {
          const withdrawAmount = BigNumber.from('0');
          await chai
            .expect(
              coa.withdrawDaoDeposits(withdrawAmount, creator, superDaoAddress)
            )
            .to.be.revertedWith('Amount cannot be ZERO');
        });

        it('Fail when the address is invalid', async () => {
          const withdrawAmount = BigNumber.from('10000000000');
          await chai.expect(
            coa.withdrawDaoDeposits(withdrawAmount, '0x0', superDaoAddress)
          ).to.be.reverted;
        });

        it('Fail when the amount is bigger than balance', async () => {
          const withdrawAmount = BigNumber.from('100000000000000000000');
          await chai.expect(
            coa.withdrawDaoDeposits(withdrawAmount, creator, superDaoAddress)
          ).to.be.reverted;
        });
      });

      describe('On [Dao] Contract ==> ', () => {
        const newDaoData = {
          name: 'New Dao',
          daoCreator: other
        };
        // eslint-disable-next-line func-names, no-undef
        before(async function() {
          await coa.createDAO(newDaoData.name, newDaoData.daoCreator);
          daoAddress = await coa.daos(1);
          await fundRecipient(web3, {
            recipient: daoAddress,
            amount: fundValue,
            relayHubAddress: hubAddress
          });
        });

        it('Return the amount to the caller when owner calls', async () => {
          const oldBalances = await getBalances(
            hubAddress,
            relayerAddress,
            daoAddress,
            creator
          );

          const withdrawAmount = BigNumber.from('100000000000000000');
          const resultTx = await coa.withdrawDaoDeposits(
            withdrawAmount,
            creator,
            daoAddress
          );

          const newBalances = await getBalances(
            hubAddress,
            relayerAddress,
            daoAddress,
            creator
          );

          chai.assert.isTrue(
            withdrawAmount.eq(oldBalances.hub.sub(newBalances.hub))
          );
          chai.assert.isTrue(newBalances.relayer.eq(oldBalances.relayer));
          chai.assert.isTrue(
            withdrawAmount.eq(oldBalances.contract.sub(newBalances.contract))
          );

          const receiptTx = await web3.eth.getTransactionReceipt(resultTx.hash);
          const gasUsed = BigNumber.from(receiptTx.gasUsed);
          const gasPrice = await web3.eth.getGasPrice();
          const gasAmountEth = gasUsed.mul(gasPrice);
          const qtyAddedToCreatorBalance = withdrawAmount.sub(gasAmountEth);

          chai.assert.isTrue(
            oldBalances.user.add(qtyAddedToCreatorBalance).eq(newBalances.user)
          );
        });

        it('Fail when the amount is not bigger than zero', async () => {
          const withdrawAmount = BigNumber.from('0');
          await chai
            .expect(
              coa.withdrawDaoDeposits(withdrawAmount, creator, daoAddress)
            )
            .to.be.revertedWith('Amount cannot be ZERO');
        });

        it('Fail when the address is invalid', async () => {
          const withdrawAmount = BigNumber.from('10000000000');
          await chai.expect(
            coa.withdrawDaoDeposits(withdrawAmount, '0x0', daoAddress)
          ).to.be.reverted;
        });

        it('Fail when the amount is bigger than balance', async () => {
          const withdrawAmount = BigNumber.from('100000000000000000000');
          await chai.expect(
            coa.withdrawDaoDeposits(withdrawAmount, creator, daoAddress)
          ).to.be.reverted;
        });
      });
    });
  });
});
