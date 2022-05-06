/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart
 * contracts to develop impact milestones agreed
 * upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { injectMocks } = require('../../rest/util/injection');
const errors = require('../../rest/errors/exporter/ErrorExporter');
const originalMailService = require('../../rest/services/mailService');
const templateParser = require('../../rest/services/helpers/templateParser');

let mailService = Object.assign({}, originalMailService);
const restoreMailService = () => {
  mailService = Object.assign({}, originalMailService);
};

const invalidEmail = 'invalid@notfound.com';

describe('Testing mailService', () => {
  const email = {
    to: 'user@test.com',
    from: 'coa@support.com',
    subject: 'Hello from COA',
    text: 'Welcome to',
    html: '<b>COA</b>'
  };

  beforeAll(() => {
    templateParser.completeTemplate = jest.fn();
  });

  afterEach(() => restoreMailService());

  const emailClient = {
    sendMail: args => {
      if (args.to === invalidEmail) return { rejected: 'rejected' };
      return args;
    },
    isNodeMailer: () => true
  };

  describe('Test sendMail method', () => {
    beforeEach(() => {
      injectMocks(mailService, {
        emailClient
      });
    });

    it('should resolve and return the info', async () => {
      await expect(mailService.sendMail(email)).resolves.toEqual(
        expect.anything()
      );
    });

    it('should throw an error if any required param is missing', async () => {
      await expect(mailService.sendMail({ text: 'optional' })).rejects.toThrow(
        errors.common.RequiredParamsMissing('sendMail')
      );
    });

    it('should throw an error if the email was rejected', async () => {
      await expect(
        mailService.sendMail({ ...email, to: invalidEmail })
      ).rejects.toThrow(errors.mail.EmailNotSent);
    });
  });

  describe('Test sendSignUpMail method', () => {
    beforeEach(() => {
      injectMocks(mailService, {
        sendMail: jest.fn()
      });
    });

    it('should resolve and call completeTemplate and sendMail', async () => {
      const bodyContent = { param: 'Email Param' };
      await expect(
        mailService.sendSignUpMail({
          ...email,
          bodyContent
        })
      ).resolves.toBeUndefined();

      expect(templateParser.completeTemplate).toHaveBeenCalled();
      expect(mailService.sendMail).toHaveBeenCalled();
    });

    it('should throw an error if any required param is missing', async () => {
      await expect(
        mailService.sendSignUpMail({ text: 'optional' })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('sendSignUpMail'));
    });
  });

  describe('Test sendProjectStatusChangeMail method', () => {
    beforeEach(() => {
      injectMocks(mailService, {
        sendMail: jest.fn()
      });
    });

    it('should resolve and call completeTemplate and sendMail', async () => {
      const bodyContent = { param: 'Email Param' };
      await expect(
        mailService.sendProjectStatusChangeMail({
          ...email,
          bodyContent
        })
      ).resolves.toBeUndefined();

      expect(templateParser.completeTemplate).toHaveBeenCalled();
      expect(mailService.sendMail).toHaveBeenCalled();
    });

    it('should throw an error if any required param is missing', async () => {
      await expect(
        mailService.sendProjectStatusChangeMail({ text: 'optional' })
      ).rejects.toThrow(
        errors.common.RequiredParamsMissing('sendProjectStatusChangeMail')
      );
    });
  });

  describe('Test sendLowBalanceGSNAccountEmail method', () => {
    const account = 'fakeAccount';
    const balance = 'fakeBalance';

    beforeEach(() => {
      injectMocks(mailService, {
        sendMail: jest.fn()
      });
    });

    it('should resolve and call completeTemplate and sendMail', async () => {
      await expect(
        mailService.sendLowBalanceGSNAccountEmail(email.to, account, balance)
      ).resolves.toBeUndefined();

      expect(templateParser.completeTemplate).toHaveBeenCalled();
      expect(mailService.sendMail).toHaveBeenCalled();
    });

    it('should throw an error if any required param is missing', async () => {
      await expect(
        mailService.sendLowBalanceGSNAccountEmail(undefined, account, balance)
      ).rejects.toThrow(
        errors.common.RequiredParamsMissing('sendLowBalanceGSNAccountEmail')
      );
    });
  });
});
