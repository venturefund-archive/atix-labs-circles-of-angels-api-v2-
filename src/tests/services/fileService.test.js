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
const fileService = require('../../rest/services/fileService');

describe('Testing fileService', () => {
  let dbFile = [];
  const resetDb = () => {
    dbFile = [];
  };

  const pdfFile = { id: 1, path: '/path/to/file.pdf' };

  const fileDao = {
    getFileById: id => {
      if (Number.isNaN(Number(id))) throw Error('dberror');
      return dbFile.find(file => file.id === id);
    },
    saveFile: path => {
      if (typeof path !== 'string') throw Error('dberror');
      const newFile = {
        id: dbFile.length + 1,
        path
      };
      dbFile.push(newFile);
      return newFile;
    },
    deleteFile: id => {
      if (Number.isNaN(Number(id))) throw Error('dberror');
      const found = dbFile.find(file => file.id === id);
      if (!found) return;
      dbFile.splice(dbFile.indexOf(found), 1);
      return found;
    }
  };

  beforeEach(() => resetDb());

  describe('getFileById method', () => {
    beforeAll(() => {
      injectMocks(fileService, {
        fileDao
      });
    });
    beforeEach(() => {
      dbFile.push(pdfFile);
    });

    it('should return the existing file', async () => {
      const response = await fileService.getFileById(pdfFile.id);
      expect(response).toEqual(pdfFile);
    });

    it('should return an object with an error if the file was not found', async () => {
      const response = await fileService.getFileById(0);
      expect(response).toEqual({
        error: 'File could not be found',
        status: 404
      });
    });

    it('should throw an error if the db call fails', async () => {
      await expect(fileService.getFileById('NaN')).rejects.toThrow(
        'Error getting file'
      );
    });
  });

  describe('saveFile method', () => {
    beforeAll(() => {
      injectMocks(fileService, {
        fileDao
      });
    });

    it('should create and save a new file with the provided path and return it', async () => {
      const newFilePath = '/path/to/newfile.jpg';
      const response = await fileService.saveFile(newFilePath);
      expect(response).toEqual({ id: 1, path: newFilePath });
    });

    it('should throw an error if the db call fails', async () => {
      await expect(fileService.saveFile(1)).rejects.toThrow(
        'Error saving file'
      );
    });
  });

  describe('deleteFile method', () => {
    beforeAll(() => {
      injectMocks(fileService, {
        fileDao
      });
    });
    beforeEach(() => {
      dbFile.push(pdfFile);
    });

    it('should delete the existing file and return it', async () => {
      const response = await fileService.deleteFile(pdfFile.id, () => {});
      expect(response).toEqual(pdfFile);
    });

    it('should return an object with an error if the file was not found', async () => {
      const response = await fileService.deleteFile(0, () => {});
      expect(response).toEqual({
        error: 'File not found in database',
        status: 404
      });
    });

    it('should throw an error if the db call fails', async () => {
      await expect(fileService.deleteFile('NaN', () => {})).rejects.toThrow(
        'Error deleting file'
      );
    });
  });

  describe('checkEvidenceFileType method', () => {
    it('should return true if the file is of a valid type', () => {
      expect(fileService.checkEvidenceFileType({ name: 'evidence.pdf' })).toBe(
        true
      );
    });
    it('should return false if the file is not of a valid type', () => {
      expect(fileService.checkEvidenceFileType({ name: 'evidence.jpg' })).toBe(
        false
      );
    });
  });
});
