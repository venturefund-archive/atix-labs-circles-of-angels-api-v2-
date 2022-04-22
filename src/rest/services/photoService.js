/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const mime = require('mime');
const { unlink } = require('fs');
const { promisify } = require('util');
const { getBase64htmlFromPath } = require('../util/images');

const unlinkPromise = promisify(unlink);

// TODO : replace with a logger;
const logger = {
  log: () => {},
  error: () => {},
  info: () => {}
};

module.exports = {
  /**
   * Returns a record from the Photo table
   *
   * @param {number} photoId
   * @returns photo object | error
   */
  async getPhotoById(photoId) {
    logger.info('[Photo Service] :: Getting photo ID:', photoId);

    try {
      const photo = await this.photoDao.getPhotoById(photoId);

      if (!photo || photo == null) {
        logger.error(
          `[Photo Service] :: Photo ID ${photoId} could not be found in database`
        );
        return {
          error: 'Photo could not be found',
          status: 404
        };
      }

      logger.info('[Photo Service] :: Photo found:', photo);
      return photo;
    } catch (error) {
      logger.error('[Photo Service] :: Error getting photo:', error);
      throw Error('Error getting photo');
    }
  },

  /**
   * Looks up the photo in the database and encodes it to base64
   *
   * @param {number} photoId photo's id
   * @returns base64 encoded photo | error message
   */
  async getBase64Photo(photoId) {
    logger.info('[Photo Service] :: Getting photo ID:', photoId);

    try {
      const photo = await this.photoDao.getPhotoById(photoId);

      if (!photo || photo == null) {
        logger.error(
          `[Photo Service] :: Photo ID ${photoId} could not be found in database`
        );
        return {
          error: 'Photo could not be found',
          status: 404
        };
      }

      logger.info('[Photo Service] :: Photo found:', photo);
      const encodedPhoto = getBase64htmlFromPath(photo.path);

      if (!encodedPhoto || encodedPhoto == null || encodedPhoto === '') {
        logger.error(
          `[Photo Service] :: There was an error encoding the photo ID ${
            photo.id
          }`
        );
        return {
          error: 'There was an error encoding the photo',
          status: 409
        };
      }

      logger.info(`[Photo Service] :: Photo ID ${photo.id} encoded`);
      return encodedPhoto;
    } catch (error) {
      logger.error('[Photo Service] :: Error getting photo:', error);
      throw Error('Error getting photo');
    }
  },

  /**
   * Creates a new record in the Photos table
   *
   * @param {string} path photo file path
   * @returns saved photo
   */
  async savePhoto(path, projectExperienceId) {
    logger.info('[Photo Service] :: Saving photo in database:', path);

    try {
      const newPhoto = { path };
      if (projectExperienceId) {
        newPhoto.projectExperience = projectExperienceId;
      }
      const photo = await this.photoDao.savePhoto(newPhoto);

      logger.info('[Photo Service] :: Photo saved:', photo);
      return photo;
    } catch (error) {
      logger.error('[Photo Service] :: Error saving photo to database:', error);
      throw Error('Error saving photo');
    }
  },

  /**
   * Updates a record in the Photos table
   *
   * @param {number} photoId photo to update
   * @param {string} path new path
   * @returns updated photo
   */
  async updatePhoto(photoId, path) {
    logger.info(`[Photo Service] :: Updating photo ID ${photoId}:`, path);

    try {
      const updatedPhoto = await this.photoDao.updatePhoto(photoId, path);

      if (!updatedPhoto || updatedPhoto == null) {
        logger.error(
          `[Photo Service] :: Photo ID ${photoId} not found in database:`
        );
        return {
          error: 'Photo could not be found',
          status: 404
        };
      }

      logger.info('[Photo Service] :: Photo updated:', updatedPhoto);
      return updatedPhoto;
    } catch (error) {
      logger.error('[Photo Service] :: Error updating photo:', error);
      throw Error('Error updating photo');
    }
  },

  /**
   * Deletes a record in the Photo table
   *
   * @param {number} photoId photo to delete
   * @returns deleted photo
   */
  async deletePhoto(photoId) {
    logger.info(`[Photo Service] :: Deleting photo ID ${photoId}`);

    try {
      const deletedPhoto = await this.photoDao.deletePhoto(photoId);

      await unlinkPromise(deletedPhoto.path);

      if (!deletedPhoto || deletedPhoto == null) {
        logger.error(
          `[Photo Service] :: Photo ID ${photoId} not found in database:`
        );
        return {
          error: 'Photo not found in database',
          status: 404
        };
      }

      logger.info('[Photo Service] :: Photo deleted:', deletedPhoto);
      return deletedPhoto;
    } catch (error) {
      logger.error('[Photo Service] :: Error deleting photo:', error);
      throw Error('Error deleting photo');
    }
  },

  checkEvidencePhotoType(photo) {
    const fileType = mime.lookup(photo.name);
    return fileType.includes('image/');
  }
};
