const fs = require('fs');
const readline = require('readline');
const { deployments } = require('hardhat');

const blankPathToFile = './__addressesToWhitelist.txt';

async function whiteListProcess(arrAddresses, resp) {
  let usersWhitelistContract;
  try {
    usersWhitelistContract = await deployments.getLastDeployedContract(
      'UsersWhitelist'
    );
  } catch (err) {
    throw err;
  }

  let i = 0;
  let action;
  if (resp === 'rmv') action = 'removed';
  else action = 'whitelisted';

  // eslint-disable-next-line no-console
  console.log('\nQuantity of addresses to process: >> ', arrAddresses.length);
  while (i < arrAddresses.length) {
    try {
      if (resp === 'add') {
        // eslint-disable-next-line no-await-in-loop
        await usersWhitelistContract.addUser(arrAddresses[i]);
      } else {
        // eslint-disable-next-line no-await-in-loop
        await usersWhitelistContract.removeUser(arrAddresses[i]);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(
        '\nAddress :>> ',
        arrAddresses[i],
        `was already ${action}! or the provided Address is Invalid`
      );
    }
    i++;
  }

  let success = true;
  let retUser;
  for (i = 0; i < arrAddresses.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    retUser = await usersWhitelistContract.users(arrAddresses[i]);

    if (resp === 'add' && !retUser) {
      success = false;
      // eslint-disable-next-line no-console
      console.log('\nAddress :>> ', arrAddresses[i], 'was not whitelisted!');
    }
    if (resp === 'rmv' && retUser) {
      success = false;
      // eslint-disable-next-line no-console
      console.log('\nAddress :>> ', arrAddresses[i], 'was not removed!');
    }
  }
  // eslint-disable-next-line no-console
  if (success) console.log(`\n\nRemaining addresses where ${action} successfully\n\n`);
  // eslint-disable-next-line no-console
  else console.log('\n\nUnexpected behaviour occurred !!\n\n');
}

// -------------------------------------------------------------------------------------------

async function whiteListProductionAddressesItf(pathToFile = blankPathToFile) {
  let arrAddresses;
  let resp;
  // eslint-disable-next-line no-console
  console.clear();
  fs.readFile(pathToFile, 'utf8', (err, data) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.log(
        '\n\nError!! \n\nInvalid File in path :>> ',
        pathToFile,
        '\n\n'
      );
      process.exit(0);
      // throw err;
    }
    arrAddresses = data.toString().split('\n');
    // eslint-disable-next-line no-console
    console.log('\n\npathToFile :>> ', pathToFile, '\n\n');
    arrAddresses = arrAddresses.filter(item => item);
    for (let i = 0; i < arrAddresses.length; i++) {
      // eslint-disable-next-line no-console
      console.log(arrAddresses[i]);
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(
      '\n\n\n[Whitelist] ==> Add/Remove these addresses ? (Type [add] or [rmv] and press Enter. Other to quit): ',
      function userResponse(userResp) {
        resp = userResp;
        rl.close();
      }
    );

    rl.on('close', function onResponse() {
      if (resp === 'add' || resp === 'rmv')
        whiteListProcess(arrAddresses, resp);
      else {
        // eslint-disable-next-line no-console
        console.log('\nOther selected. Bye bye!');
        process.exit(0);
      }
    });
  });
}

// -------------------------------------------------------------------------------------------

// CALL THE MAIN FUNCTION
whiteListProductionAddressesItf(process.argv[2]);
