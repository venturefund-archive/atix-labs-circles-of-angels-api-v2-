/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const fs = require('fs');
const configs = require('config');
const mime = require('mime');
const sharp = require('sharp');
const mkdirp = require('mkdirp-promise');
const logger = require('../logger');
const validateMtype = require('../services/helpers/validateMtype');
const validatePhotoSize = require('../services/helpers/validatePhotoSize'); // TODO: change name
const COAError = require('../errors/COAError');
const errors = require('../errors/exporter/ErrorExporter');

const getFileFromPath = filepath => {
  const file = fs.createReadStream(filepath, 'utf8');
  return file;
};

const fileExists = filepath =>
  new Promise(resolve =>
    fs.access(filepath, fs.constants.F_OK, error => {
      if (error) resolve(false);
      resolve(true);
    })
  );

const TYPES = {
  milestones: 'milestones',
  thumbnail: 'thumbnail',
  coverPhoto: 'coverPhoto',
  projectExperiencePhoto: 'projectExperiencePhoto',
  transferReceipt: 'transferReceipt',
  claims: 'claims',
  transferClaims: 'transferClaims',
  agreementFile: 'agreementFile',
  proposalFile: 'proposalFile',
  milestoneClaim: 'milestoneClaim',
  legalAgreementFile: 'legalAgreementFile',
  projectProposalFile: 'projectProposalFile',
  evidence: 'evidence'
};

const JPEG = '.jpeg';
const XLSX = '.xlsx';
const PDF = '.pdf';
const JSON_EXTENSION = '.json';

const getCoverPhotoPath = () =>
  `${configs.fileServer.filePath}/projects/coverPhotos/`;

const getCardPhotoPath = () =>
  `${configs.fileServer.filePath}/projects/cardPhotos/`;

const getMilestonesPath = () =>
  `${configs.fileServer.filePath}/projects/milestones/`;

const getProjectExperiencePath = () =>
  `${configs.fileServer.filePath}/projects/experiencePhotos/`;

const getTransferReceiptPath = () =>
  `${configs.fileServer.filePath}/projects/transfers/`;

const getClaimsPath = () =>
  `${configs.fileServer.filePath}/projects/milestones/tasks/claims/`;

const getTransferClaimsPath = () =>
  `${configs.fileServer.filePath}/projects/transfers/claims/`;

const getProposalPath = () =>
  `${configs.fileServer.filePath}/projects/proposal/`;

const getAgreementPath = () =>
  `${configs.fileServer.filePath}/projects/agreement/`;

const getMilestoneClaimPath = () =>
  `${configs.fileServer.filePath}/projects/milestones/claim/`;

const getMetadataPath = projectId =>
  `${configs.fileServer.filePath}/projects/metadata/${projectId}`;

const getEvidencePath = () =>
  `${configs.fileServer.filePath}/projects/evidence/`;

const savePhotoJpgFormat = async (image, savePath, maxWidth = 1250) =>
  new Promise((resolve, reject) => {
    sharp(image.data)
      .resize({
        width: maxWidth,
        options: {
          fit: 'outside'
        }
      })
      .flatten()
      .jpeg()
      .toFile(savePath, (err, res) => {
        if (err) {
          reject(err);
        }
        resolve(res);
      });
  });

const commonSaver = async (file, savePath) => file.mv(savePath);

const fileSaver = {
  // TODO: import type validators and indicate max size for each one
  [TYPES.milestones]: {
    save: commonSaver,
    getBasePath: getMilestonesPath,
    defaultFileExtension: XLSX
  },
  [TYPES.thumbnail]: {
    save: savePhotoJpgFormat,
    getBasePath: getCardPhotoPath,
    defaultFileExtension: JPEG
  },
  [TYPES.coverPhoto]: {
    save: savePhotoJpgFormat,
    getBasePath: getCoverPhotoPath,
    defaultFileExtension: JPEG
  },
  [TYPES.projectExperiencePhoto]: {
    save: savePhotoJpgFormat,
    getBasePath: getProjectExperiencePath,
    defaultFileExtension: JPEG
  },
  [TYPES.transferReceipt]: {
    save: savePhotoJpgFormat,
    getBasePath: getTransferReceiptPath,
    defaultFileExtension: JPEG
  },
  [TYPES.claims]: {
    save: savePhotoJpgFormat,
    getBasePath: getClaimsPath,
    defaultFileExtension: JPEG
  },
  [TYPES.transferClaims]: {
    save: savePhotoJpgFormat,
    getBasePath: getTransferClaimsPath,
    defaultFileExtension: JPEG
  },
  [TYPES.agreementFile]: {
    save: commonSaver,
    getBasePath: getAgreementPath,
    defaultFileExtension: PDF
  },
  [TYPES.proposalFile]: {
    save: commonSaver,
    getBasePath: getProposalPath,
    defaultFileExtension: PDF
  },
  [TYPES.milestoneClaim]: {
    save: savePhotoJpgFormat,
    getBasePath: getMilestoneClaimPath,
    defaultFileExtension: JPEG
  },
  [TYPES.metadata]: {
    save: commonSaver,
    getBasePath: getMetadataPath,
    defaultFileExtension: JSON
  },
  [TYPES.evidence]: {
    save: commonSaver,
    getBasePath: getEvidencePath,
    defaultFileExtension: JPEG
  }
};

const saveFile = async (type, file) => {
  const saver = fileSaver[type];
  const hash = file.md5;
  const fileExtension = '.'.concat(
    mime.extension(mime.lookup(file.name)) || saver.defaultFileExtension
  );
  const withFileExtension = hash.concat(fileExtension);
  let path = saver
    .getBasePath()
    .concat(hash.charAt(0))
    .concat('/');
  await mkdirp(path);
  path = path.concat(withFileExtension);
  await saver.save(file, path);
  return path.replace(`${configs.fileServer.filePath}/projects`, '');
};

/**
 * Returns the path where the file would be saved, but do not save it.
 * Used to build unsigned transactions.
 * @param {String} type
 * @param {File} file
 */
const getSaveFilePath = async (type, file) => {
  const saver = fileSaver[type];
  const hash = file.md5;
  const fileExtension = '.'.concat(
    mime.extension(mime.lookup(file.name)) || saver.defaultFileExtension
  );
  const withFileExtension = hash.concat(fileExtension);
  let path = saver
    .getBasePath()
    .concat(hash.charAt(0))
    .concat('/');
  path = path.concat(withFileExtension);
  return path.replace(configs.fileServer.filePath, '/files');
};

const validateAndSaveFile = async (type, file) => {
  // TODO: should get fileSaver[type] with validator for type and max size
  validateMtype(type, file);
  validatePhotoSize(file);
  logger.info(`[Files] :: Saving file of type '${type}'`);
  const path = await saveFile(type, file);
  logger.info(`[Files] :: File saved to: ${path}`);
  return path;
};

const saveJsonFile = async (data, fileName) => {
  logger.info(`[Files] :: about to save JSON file ${data}`);
  const json = JSON.stringify(data);
  fs.writeFileSync(fileName, json);
  logger.info('[Files] :: JSON files successfully saved');
};

const saveProjectMetadataFile = async ({ data, projectId }) => {
  const path = `${configs.fileServer.filePath}/projects/metadata/${projectId}`;
  await mkdirp(path);
  const fileName = `${projectId}${JSON_EXTENSION}`;
  try {
    return saveJsonFile(data, `${path}/${fileName}`);
  } catch (error) {
    logger.error('[Files] :: There was an error writting JSON file ', error);
    throw new COAError(errors.server.InternalServerError);
  }
};

const saveActivityFile = async ({ data, taskId }) => {
  const path = `${configs.fileServer.filePath}/projects/activities`;
  await mkdirp(path);
  const fileName = `${taskId}${JSON_EXTENSION}`;
  try {
    return saveJsonFile(data, `${path}/${fileName}`);
  } catch (error) {
    logger.error('[Files] :: There was an error writting JSON file ', error);
    throw new COAError(errors.server.InternalServerError);
  }
};

module.exports = {
  getFileFromPath,
  getSaveFilePath,
  fileExists,
  TYPES,
  saveFile,
  validateAndSaveFile,
  saveActivityFile,
  saveProjectMetadataFile
};
