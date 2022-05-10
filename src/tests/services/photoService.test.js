/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart
 * contracts to develop impact milestones agreed upon
 * by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const testHelper = require('../testHelper');
const photoService = require('../../rest/services/photoService');
const { injectMocks } = require('../../rest/util/injection');

const fastify = {
  log: { info: jest.fn(), error: jest.fn() },
  configs: require('config')
};

const { getBase64htmlFromPath } = require('../../rest/util/images');

describe('Testing photoService getBase64Photo', () => {
  let photoDao;
  const filepath = testHelper.getMockFiles().projectCardPhoto.path;

  const photoId = 1;

  beforeAll(() => {
    photoDao = {
      async getPhotoById(id) {
        if (id === '') {
          throw Error('DB Error');
        }

        if (id === 0) {
          return undefined;
        }

        if (id === 2) {
          return { id, path: '' };
        }
        return { id, path: filepath };
      }
    };
    injectMocks(photoService, { photoDao });
  });

  it('should return a photo encoded in base64', async () => {
    const response = await photoService.getBase64Photo(photoId);
    const expected = getBase64htmlFromPath(filepath);

    return expect(response).toEqual(expected);
  });

  it('should return an error if the photo was not found in database', async () => {
    const response = await photoService.getBase64Photo(0);
    const expected = {
      error: 'Photo could not be found',
      status: 404
    };

    return expect(response).toEqual(expected);
  });

  it('should return an error if there was an error encoding the photo', async () => {
    const response = await photoService.getBase64Photo(2);
    const expected = {
      error: 'There was an error encoding the photo',
      status: 409
    };

    return expect(response).toEqual(expected);
  });

  it('should throw an error if the database query fails', async () =>
    expect(photoService.getBase64Photo('')).rejects.toEqual(
      Error('Error getting photo')
    ));
});

describe('Testing photoService savePhoto', () => {
  let photoDao;

  const photoId = 12;
  const filepath = testHelper.getMockFiles().projectCardPhoto.path;

  beforeAll(() => {
    photoDao = {
      async savePhoto(photo) {
        if (photo.path === '') {
          throw Error('Error saving photo');
        }

        return { id: photoId, ...photo };
      }
    };
    injectMocks(photoService, { photoDao });
  });

  it('should return the saved photo', async () => {
    const projectExperience = 1;
    const response = await photoService.savePhoto(filepath, projectExperience);

    const expected = { id: photoId, path: filepath, projectExperience };

    return expect(response).toEqual(expected);
  });

  it(
    'should throw an error if there was an error ' +
      'saving the photo to database',
    async () =>
      expect(photoService.savePhoto('')).rejects.toEqual(
        Error('Error saving photo')
      )
  );
});

describe('Testing photoService updatePhoto', () => {
  let photoDao;

  const photoId = 1;
  const filepath = testHelper.getMockFiles().projectCardPhoto.path;

  beforeAll(() => {
    photoDao = {
      async updatePhoto(id, path) {
        if (id === '') {
          throw Error('Error updating photo');
        }

        if (id === 0) {
          return undefined;
        }

        return { id, path };
      }
    };
    injectMocks(photoService, { photoDao });
  });

  it('should return the updated photo', async () => {
    const response = await photoService.updatePhoto(photoId, filepath);

    const expected = { id: photoId, path: filepath };

    return expect(response).toEqual(expected);
  });

  it('should return an error if the record could not be found', async () => {
    const response = await photoService.updatePhoto(0, filepath);

    const expected = {
      error: 'Photo could not be found',
      status: 404
    };

    return expect(response).toEqual(expected);
  });

  it(
    'should throw an error if there was an error ' +
      'updating the photo in database',
    async () =>
      expect(photoService.updatePhoto('', filepath)).rejects.toEqual(
        Error('Error updating photo')
      )
  );
});

describe('Testing photoService getPhotoById', () => {
  let photoDao;
  const filepath = testHelper.getMockFiles().projectCardPhoto.path;
  beforeAll(() => {
    photoDao = {
      async getPhotoById(id) {
        if (id === '') {
          throw Error('Error updating photo');
        }

        if (id === 0) {
          return null;
        }

        return { id, filepath };
      }
    };
    injectMocks(photoService, { photoDao });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return photo by ID', async () => {
    const id = 1;
    const response = await photoService.getPhotoById(id);
    expect(response).toBeDefined();
    expect(response).toEqual({
      id: 1,
      filepath:
        '/Users/ivano.garcia/Proyectos/ATIX/COA/backend/circles-of-angels-api-v2/src/tests/mockFiles/projectCardPhoto.png'
    });
  });
  it('should return an error by photo not found', async () => {
    const id = 0;
    const response = await photoService.getPhotoById(id);
    expect(response).toBeDefined();
    expect(response).toEqual({
      error: 'Photo could not be found',
      status: 404
    });
  });
  it(
    'should throw an error if there was an error ' +
      'getting the photo in database',
    async () =>
      expect(photoService.getPhotoById('')).rejects.toEqual(
        Error('Error getting photo')
      )
  );
});
