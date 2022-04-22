const files = require('../util/files');
const COAError = require('../errors/COAError');
const errors = require('../errors/exporter/ErrorExporter');
const { projectStatuses } = require('../util/constants');
const validateRequiredParams = require('../services/helpers/validateRequiredParams');
const validateMtype = require('../services/helpers/validateMtype');
const validateOwnership = require('../services/helpers/validateOwnership');
const validatePhotoSize = require('../services/helpers/validatePhotoSize');

const logger = require('../logger');

module.exports = {
  validatePhotos(photos) {
    photos.forEach(photo => {
      logger.info(
        '[ProjectExperienceService] :: Entering validatePhotos method'
      );
      logger.info(
        '[ProjectExperienceService] ::   About to validate mtypes of project experience photo'
      );
      validateMtype('experiencePhoto', photo);
      logger.info(
        '[ProjectExperienceService] :: About to validate size of project experience photo'
      );
      validatePhotoSize(photo);
    });
  },
  canUpload(project, user) {
    const { status, owner } = project;
    const onlyOwnerStatuses = [
      projectStatuses.CONSENSUS,
      projectStatuses.FUNDING
    ];
    if (onlyOwnerStatuses.includes(status)) {
      validateOwnership(owner, user.id);
      return true;
    }
    if (
      [projectStatuses.EXECUTING, projectStatuses.FINISHED].includes(status)
    ) {
      return true;
    }
    throw new COAError(errors.project.InvalidStatusForExperienceUpload(status));
  },
  async savePhotos(photos) {
    logger.info('[ProjectExperienceService] :: Entering savePhotos method');
    logger.info(
      '[ProjectExperienceService] :: About to save all the photo files of project experience'
    );
    const photoPaths = await Promise.all(
      photos.map(async photo => {
        try {
          const path = await files.saveFile('projectExperiencePhoto', photo);
          return path;
        } catch (error) {
          // TODO: if one fails should all fail too or ignore it?

          // this skips this photo and keep uploading the rest
          logger.error(
            '[ProjectExperienceService] :: Error saving photo',
            error
          );
        }
      })
    );
    // remove undefined because of the failed ones
    return photoPaths.filter(path => !!path);
  },
  async addExperience({ comment, projectId, userId, photos }) {
    logger.info('[ProjectExperienceService] :: Entering addExperience method');
    // TODO: are comment and photos both mandatory fields?
    validateRequiredParams({
      method: 'addExperience',
      params: { comment, projectId, userId, photos }
    });
    logger.info(
      '[ProjectExperienceService] :: About to validate project experience existence'
    );
    const project = await this.projectService.getProjectById(projectId);
    logger.info(
      '[ProjectExperienceService] :: About to validate user existence'
    );
    const user = await this.userService.getUserById(userId);
    this.canUpload(project, user);
    this.validatePhotos(photos);

    logger.info(
      '[ProjectExperienceService] :: About to save project experience'
    );
    const { id } = await this.projectExperienceDao.saveProjectExperience({
      comment,
      project: projectId,
      user: userId
    });
    const photosPath = await this.savePhotos(photos);
    logger.info(
      '[ProjectExperienceService] :: About to save project experience photo paths'
    );
    await Promise.all(
      photosPath.map(async path =>
        this.projectExperiencePhotoDao.saveProjectExperiencePhoto({
          path,
          projectExperience: id
        })
      )
    );
    return { projectExperienceId: id };
  },
  async getProjectExperiences({ projectId }) {
    logger.info('[ProjectServiceExperience] :: Entering getProjectExperiences');
    logger.info(
      '[ProjectExperienceService] :: About to check that all parameters are not undefined'
    );
    validateRequiredParams({
      method: 'getProjectExperiences',
      params: { projectId }
    });
    logger.info(
      '[ProjectExperienceService] :: About to validate project existence'
    );
    await this.projectService.getProjectById(projectId);
    logger.info(
      '[ProjectExperienceService] :: About to get all experiences by project'
    );
    return this.projectExperienceDao.getExperiencesByProjectId(projectId);
  }
};
