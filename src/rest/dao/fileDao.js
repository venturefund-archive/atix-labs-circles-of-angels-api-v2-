/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const getFileById = fileModel => async id => {
  const file = await fileModel.findOne({ id });
  return file;
};

const saveFile = fileModel => async path => {
  const savedFile = await fileModel.create({
    path
  });
  return savedFile;
};

const deleteFile = fileModel => async fileId => {
  const deletedFile = await fileModel.destroyOne({ id: fileId });
  return deletedFile;
};

module.exports = fileModel => ({
  saveFile: saveFile(fileModel),
  deleteFile: deleteFile(fileModel),
  getFileById: getFileById(fileModel)
});
