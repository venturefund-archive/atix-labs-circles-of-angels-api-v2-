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

describe('Testing PassRecoveryService startPassRecoveryProcess', () => {
  let userDao;
  let passRecoveryDao;
  let mailService;

  beforeAll(() => {
    userDao = {
      getUserByEmail: email =>
        email === 'notvalid@email.com'
          ? undefined
          : buildGenericUserWithEmail(email)
    };
    passRecoveryDao = {
      createRecovery: () => passRecovery
    };
    mailService = {
      sendEmailRecoveryPassword: () => ({ accepted: ['dummy@email.com'] })
    };
    injectMocks(passRecoveryService, { passRecoveryDao, userDao, mailService });
    bcrypt.compare = jest.fn();
  });

  it('should success when the given email is found', async () => {
    bcrypt.compare.mockReturnValueOnce(true);
    const response = await passRecoveryService.startPassRecoveryProcess(
      'dummy@email.com'
    );
    expect(response).toEqual('dummy@email.com');
  });
  it('should fail with an error when the given email is not found', async () => {
    bcrypt.compare.mockReturnValueOnce(true);
    await expect(
      passRecoveryService.startPassRecoveryProcess('notvalid@email.com')
    ).rejects.toThrow(errors.user.EmailNotExists('notvalid@email.com'));
  });
});

describe('Testing PassRecoveryService updatePassword', () => {
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
    userDao = { updatePasswordByMail: true };
    injectMocks(passRecoveryService, { passRecoveryDao, userDao });
    bcrypt.compare = jest.fn();
  });

  it('should success when the token and password are valid', async () => {
    bcrypt.compare.mockReturnValueOnce(true);
    const response = passRecoveryService.updatePassword(
      '1d362dd70c3288ea7db239d04b57eea767112b0c77c5548a00',
      'newpassword',
      { address: '0x000000000000000000000000' }
    );
    expect(response).toBeTruthy();
  });

  it('should  fail with an error when the given token is not found on the database', async () => {
    bcrypt.compare.mockReturnValueOnce(true);
    await expect(
      passRecoveryService.updatePassword(TOKEN_NOT_FOUND, 'newpassword', {})
    ).rejects.toThrow('updating password');
  });
});
