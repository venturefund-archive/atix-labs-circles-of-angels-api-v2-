/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart
 * contracts to develop impact milestones agreed
 * upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const errors = require('../../../rest/errors/exporter/ErrorExporter');
const COAError = require('../../../rest/errors/COAError');
const {
  validateExistence,
  validateParams,
  validateMtype,
  validatePhotoSize,
  xslValidator,
  imgValidator
} = require('../../../rest/services/helpers/projectServiceHelper');

describe('Project service helper', () => {
  // here are the variables of dependencies to inject

  describe('- ValidateParams', () => {
    it('Whenever one param is undefined, validateParams should throw COAError', async () => {
      const params = undefined;
      const notParamUndefined = 'this is not undefined';
      expect(() => validateParams(params, notParamUndefined)).toThrow(
        errors.project.CreateProjectFieldsNotValid
      );
    });

    it('Whenever the only param is undefined, validateParams should throw COAError', async () => {
      const params = undefined;
      expect(() => validateParams(params)).toThrow(
        errors.project.CreateProjectFieldsNotValid
      );
    });

    it('Whenever no param is undefined, validateParams should NOT throw COAError', async () => {
      const params = 'this is not undefined';
      const params2 = 'this is still not undefined';
      expect(() => validateParams(params, params2)).not.toThrow(COAError);
    });
  });

  describe('- ValidateExistence', () => {
    const projectDao = {
      findById: async id => {
        if (id === 1) {
          return new Promise(resolve => resolve);
        }
        return new Promise(resolve => resolve(undefined));
      }
    };

    it('Should not throw an error whenever the object exists', async () => {
      const idOfObjectThatExists = 1;
      expect(
        validateExistence(projectDao, idOfObjectThatExists, 'projectMock')
      ).rejects.not.toThrow(COAError);
    });

    it('Should return an object whenever the object exists', async () => {
      const idOfObjectThatExists = 1;
      expect(
        validateExistence(projectDao, idOfObjectThatExists, 'projectMock')
      ).resolves.toHaveProperty('id', 1);
    });

    it('Should throw an error whenever the object queried does not exist', async () => {
      const idOfObjectThatDoesntExists = 2;
      expect(
        validateExistence(projectDao, idOfObjectThatDoesntExists, 'projectMock')
      ).rejects.toThrow(COAError);
    });
  });

  describe('- ValidateMtype', () => {
    const validImgFile = { mtype: 'image/', name: 'file.png' };
    const invalidFile = { mtype: 'application/json', name: 'file.json' };
    const validMilestoneFile = {
      mtype: 'application/vnd.ms-excel',
      name: 'file.xlsx'
    };

    it('If cover photo file has a valid mtype, it should not throw an error', () => {
      expect(() => validateMtype('coverPhoto')(validImgFile)).not.toThrow(
        Error
      );
    });

    it('If cover photo file has an invalid mtype, it should throw an error', () => {
      expect(() => validateMtype('coverPhoto')(invalidFile)).toThrow(COAError);
    });

    it('If thumbnail file has a valid mtype, it should not throw an error', () => {
      expect(() => validateMtype('thumbnail')(validImgFile)).not.toThrow(Error);
    });

    it('If thumbnail file has an invalid mtype, it should throw an error', () => {
      expect(() => validateMtype('thumbnail')(invalidFile)).toThrow(COAError);
    });

    it('If milestones file has a valid mtype, it should not throw an error', () => {
      expect(() => validateMtype('milestones')(validMilestoneFile)).not.toThrow(
        Error
      );
    });

    it('If milestones file has an invalid mtype, it should throw an error', () => {
      expect(() => validateMtype('milestones')(invalidFile)).toThrow(COAError);
    });
  });

  describe('- ValidatePhotoSize', () => {
    const bigPhotoFile = { size: 700000 };
    const equalMaxPhotoFile = { size: 500000 };
    const validPhotoFile = { size: 12314 };

    it('If the photo file has a bigger size than allowed, it should throw an error', () => {
      expect(() => validatePhotoSize(bigPhotoFile)).toThrow(COAError);
    });

    it('If the photo file has a lower size than allowed, it should not throw an error', () => {
      expect(() => validatePhotoSize(validPhotoFile)).not.toThrow(Error);
    });

    it('If the photo file has an equal size than allowed, it should not throw an error', () => {
      expect(() => validatePhotoSize(equalMaxPhotoFile)).not.toThrow(COAError);
    });
  });

  describe('- XlslValidator', () => {
    const invalidFile = { mtype: 'application/json', name: 'file.json' };
    const validMilestoneFile = {
      mtype: 'application/vnd.ms-excel',
      name: 'file.xlsx'
    };

    it('If the file passed to xlslValidator has a valid type, it should not throw an error', () => {
      expect(() => xslValidator(validMilestoneFile)).not.toThrow(COAError);
    });
    it('If the file passed to xlslValidator has not a valid type, it should throw an error', () => {
      expect(() => xslValidator(invalidFile)).toThrow(COAError);
    });
  });

  describe('- ImgValidator', () => {
    const validImgFile = { mtype: 'image/', name: 'file.png' };
    const invalidFile = { mtype: 'application/json', name: 'file.json' };

    it('If the file passed to imgValidator is not a valid img file, it should throw an error', () => {
      expect(() => imgValidator(validImgFile)).not.toThrow(COAError);
    });
    it('If the file passed to imgValidator is a valid img file, it should not throw an error', () => {
      expect(() => imgValidator(invalidFile)).toThrow(COAError);
    });
  });
});
