/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */
const bcrypt = require('bcrypt');
const { buildGenericUserWithEmail } = require('../testHelper');
const { passRecovery, passRecoveryWithExpiredToken } = require('../mockModels');
const { injectMocks } = require('../../rest/util/injection');
const passRecoveryService = require('../../rest/services/passRecoveryService');
const errors = require('../../rest/errors/exporter/ErrorExporter');

const getUserByEmail = email =>
  email === 'notvalid@email.com' ? undefined : buildGenericUserWithEmail(email);

describe('Testing PassRecoveryService startPassRecoveryProcess', () => {
  let userDao;
  let passRecoveryDao;
  let mailService;
  let projectDao;
  const dbProject = [];
  const dbUserProject = [];
  let userProjectDao;
  const project1 = { id: 1, projectName: 'projectName' };
  const project2 = { id: 2, projectName: 'projectName2' };

  beforeAll(() => {
    dbProject.push(project1);
    dbProject.push(project2);
    dbUserProject.push({
      userId: buildGenericUserWithEmail('dummy@email.com').id,
      projectId: project1.id
    });
    userDao = {
      getUserByEmail
    };
    passRecoveryDao = {
      createRecovery: () => passRecovery
    };
    mailService = {
      sendEmailRecoveryPassword: () => ({ accepted: ['dummy@email.com'] })
    };
    projectDao = {
      findById: id => dbProject.find(p => p.id === id)
    };
    userProjectDao = {
      findUserProject: ({ user, project }) =>
        dbUserProject.find(up => up.userId === user && up.projectId === project)
    };
    injectMocks(passRecoveryService, {
      passRecoveryDao,
      userDao,
      mailService,
      projectDao,
      userProjectDao
    });
    bcrypt.compare = jest.fn();
  });

  it('should success when the given email is found', async () => {
    bcrypt.compare.mockReturnValueOnce(true);
    const response = await passRecoveryService.startPassRecoveryProcess(
      'dummy@email.com'
    );
    expect(response).toEqual('dummy@email.com');
  });
  it('should success when the given email and projectId are valids', async () => {
    bcrypt.compare.mockReturnValueOnce(true);
    const response = await passRecoveryService.startPassRecoveryProcess(
      'dummy@email.com',
      project1.id
    );
    expect(response).toEqual('dummy@email.com');
  });
  it('should fail with an error when the given email is not found', async () => {
    bcrypt.compare.mockReturnValueOnce(true);
    await expect(
      passRecoveryService.startPassRecoveryProcess('notvalid@email.com')
    ).rejects.toThrow(errors.user.EmailNotExists('notvalid@email.com'));
  });
  it('should throw when project is not found', async () => {
    bcrypt.compare.mockReturnValueOnce(true);
    const nonExistentProjectId = 99;
    await expect(
      passRecoveryService.startPassRecoveryProcess(
        'dummy@email.com',
        nonExistentProjectId
      )
    ).rejects.toThrow(
      errors.common.CantFindModelWithId('project', nonExistentProjectId)
    );
  });
  it('should throw when given user is not related to the project', async () => {
    bcrypt.compare.mockReturnValueOnce(true);
    await expect(
      passRecoveryService.startPassRecoveryProcess(
        'dummy@email.com',
        project2.id
      )
    ).rejects.toThrow(errors.user.UserNotRelatedToTheProject);
  });
});

describe('Testing PassRecoveryService updatePassword', () => {
  let passRecoveryDao;
  let userDao;
  let userWalletDao;
  const TOKEN_NOT_FOUND = 'Token not found';
  const EXPIRED_TOKEN = 'Expired token';

  beforeAll(() => {
    passRecoveryDao = {
      findRecoverBytoken: token => {
        if (token === TOKEN_NOT_FOUND) return undefined;
        if (token === EXPIRED_TOKEN) return passRecoveryWithExpiredToken;
        return passRecovery;
      },
      deleteRecoverByToken: () => {}
    };
    userDao = {
      updatePasswordByMail: true,
      getUserByEmail,
      updateUserByEmail: () => true
    };
    userWalletDao = {
      createUserWallet: (userWallet, _) => userWallet,
      updateWallet: () => false
    };
    injectMocks(passRecoveryService, {
      passRecoveryDao,
      userDao,
      userWalletDao
    });
    bcrypt.compare = jest.fn();
    bcrypt.hash = jest.fn();
  });
  it('should success when the token and password are valid', async () => {
    bcrypt.compare.mockReturnValueOnce(true);
    const response = await passRecoveryService.updatePassword(
      '0x000000000000000000000000',
      '1d362dd70c3288ea7db239d04b57eea767112b0c77c5548a00',
      'newpassword',
      { address: '0x000000000000000000000000' },
      'mnemonic'
    );
    expect(response).toEqual({
      first: buildGenericUserWithEmail(passRecoveryWithExpiredToken.email).first
    });
  });

  it('should  fail with an error when the given token is not found on the database', async () => {
    bcrypt.compare.mockReturnValueOnce(true);
    await expect(
      passRecoveryService.updatePassword(
        '1d362dd70c3288ea7db239d04b57eea767112b0c77c5548a00',
        'newpassword',
        { address: '0x000000000000000000000000' }
      )
    ).rejects.toThrow('updating password');
  });
});

describe('Testing PassRecoveryService updatePassword Errors', () => {
  let passRecoveryDao;
  let userDao;
  const TOKEN_NOT_FOUND = 'Token not found';
  const EXPIRED_TOKEN = 'Expired token';

  beforeAll(() => {
    passRecoveryDao = {
      findRecoverBytoken: token => {
        if (token === TOKEN_NOT_FOUND) return undefined;
        if (token === EXPIRED_TOKEN) return passRecoveryWithExpiredToken;
        return passRecovery;
      },
      deleteRecoverByToken: () => {}
    };
    userDao = { updatePasswordByMail: false };
    injectMocks(passRecoveryService, {
      passRecoveryDao,
      userDao
    });
    bcrypt.compare = jest.fn();
  });

  it('should  fail with an error when the user is false', async () => {
    bcrypt.compare.mockReturnValueOnce(true);
    await expect(
      passRecoveryService.updatePassword(TOKEN_NOT_FOUND, 'newpassword', {})
    ).rejects.toThrow('updating password');
  });
});

describe('Testing PassRecoveryService getMnemonicFromToken', () => {
  let passRecoveryDao;
  let userDao;
  const TOKEN_NOT_FOUND = 'Token not found';
  const EXPIRED_TOKEN = 'Expired token';

  beforeAll(() => {
    passRecoveryDao = {
      findRecoverBytoken: token => {
        if (token === TOKEN_NOT_FOUND) return undefined;
        if (token === EXPIRED_TOKEN) return passRecoveryWithExpiredToken;
        return passRecovery;
      },
      deleteRecoverByToken: () => {}
    };
    userDao = {
      getUserByEmail: email => {
        if (email === 'notvalid@email.com')
          return buildGenericUserWithEmail(email);
        if (email === null) return undefined;
      }
    };
    injectMocks(passRecoveryService, { passRecoveryDao, userDao });
    bcrypt.compare = jest.fn();
  });

  it('should success when the token and password are valid', async () => {
    bcrypt.compare.mockReturnValueOnce(true);
    const response = passRecoveryService.getMnemonicFromToken(
      '1d362dd70c3288ea7db239d04b57eea767112b0c77c5548a00'
    );
    expect(response).toBeTruthy();
  });

  it('should  fail with an error when the given token is undefined', async () => {
    bcrypt.compare.mockReturnValueOnce(true);
    await expect(
      passRecoveryService.getMnemonicFromToken(TOKEN_NOT_FOUND)
    ).rejects.toThrow('Error get mnemonic password');
  });
  it('should  fail with an error when the given token is expired', async () => {
    bcrypt.compare.mockReturnValueOnce(true);
    await expect(
      passRecoveryService.getMnemonicFromToken(EXPIRED_TOKEN)
    ).rejects.toThrow('Error get mnemonic password');
  });
  it('should fail with an error when mnemonic was not decrypted', async () => {
    bcrypt.compare.mockReturnValueOnce(true);
    await expect(
      passRecoveryService.getMnemonicFromToken(EXPIRED_TOKEN)
    ).rejects.toThrow('Error get mnemonic password');
  });
});
