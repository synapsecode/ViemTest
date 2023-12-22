// test/simpleStorage.test.js
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('SimpleStorage Contract', function () {
  let simpleStorage;

  beforeEach(async () => {
    const SimpleStorage = await ethers.getContractFactory('SimpleStorage');
    simpleStorage = await SimpleStorage.deploy();
  });

  it('Should get the initial stored value', async function () {
    const initialValue = await simpleStorage.get();
    expect(initialValue).to.equal(0);
  });

  it('Should set and get a new value', async function () {
    const newValue = 42;

    // Set a new value
    await simpleStorage.set(newValue);

    // Get the updated value
    const updatedValue = await simpleStorage.get();
    expect(updatedValue).to.equal(newValue);
  });

  it('Should emit ValueUpdated event when setting a new value', async function () {
    const newValue = 42;

    // Set a new value and check for the emitted event
    await expect(simpleStorage.set(newValue))
      .to.emit(simpleStorage, 'ValueUpdated')
      .withArgs(newValue);
  });

  it('Should check the initial balance of the contract', async function () {
    const initialBalance = await simpleStorage.checkBalance();
    expect(initialBalance).to.equal(0);
  });

  it('Should deposit funds and update the contract balance', async function () {
    const signer = await ethers.provider.getSigner();
    const depositAmount = ethers.parseEther('1');
    const initialBalance = await simpleStorage.checkBalance();
    await simpleStorage.deposit({ value: depositAmount });
    const updatedBalance = await simpleStorage.checkBalance();
    expect(updatedBalance).to.equal(initialBalance + depositAmount);
    const depositEvent = (await simpleStorage.queryFilter('Deposit'))[0].args;
    expect(depositEvent.depositor).to.equal(await signer.getAddress());
    expect(depositEvent.amount).to.equal(depositAmount);
  });

});
