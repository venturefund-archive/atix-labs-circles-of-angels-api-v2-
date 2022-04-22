/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const saveActivityFile = activityFileModel => async (
  activityId,
  fileId,
  fileHash
) => {
  const activityFile = await activityFileModel.create({
    activity: activityId,
    file: fileId,
    fileHash
  });
  return activityFile;
};

const getActivityFileByActivityAndFile = activityFileModel => async (
  activityId,
  fileId
) => {
  const activityFile = await activityFileModel.findOne({
    activity: activityId,
    file: fileId
  });
  return activityFile;
};

const getActivityFileByActivity = activityFileModel => async activityId => {
  const activityFiles = await activityFileModel
    .find({
      activity: activityId
    })
    .populate('file');
  return activityFiles;
};

const deleteActivityFile = activityFileModel => async activityFileId => {
  const deleted = activityFileModel.destroy(activityFileId).fetch();
  return deleted;
};

module.exports = activityFileModel => ({
  saveActivityFile: saveActivityFile(activityFileModel),
  deleteActivityFile: deleteActivityFile(activityFileModel),
  getActivityFileByActivityAndFile: getActivityFileByActivityAndFile(
    activityFileModel
  ),
  getActivityFileByActivity: getActivityFileByActivity(activityFileModel)
});
