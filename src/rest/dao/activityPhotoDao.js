/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const saveActivityPhoto = activityPhotoModel => async (
  activityId,
  photoId,
  fileHash
) => {
  const activityPhoto = await activityPhotoModel.create({
    activity: activityId,
    photo: photoId,
    fileHash
  });
  return activityPhoto;
};

const getActivityPhotoByActivityAndPhoto = activityPhotoModel => async (
  activityId,
  photoId
) => {
  const activityPhoto = await activityPhotoModel.findOne({
    activity: activityId,
    photo: photoId
  });
  return activityPhoto;
};

const getActivityPhotoByActivity = activityPhotoModel => async activityId => {
  const activityPhotos = await activityPhotoModel
    .find({
      activity: activityId
    })
    .populate('photo');
  return activityPhotos;
};

const deleteActivityPhoto = activityPhotoModel => async activityPhotoId => {
  const deleted = activityPhotoModel.destroy(activityPhotoId).fetch();
  return deleted;
};

module.exports = activityPhotoModel => ({
  saveActivityPhoto: saveActivityPhoto(activityPhotoModel),
  deleteActivityPhoto: deleteActivityPhoto(activityPhotoModel),
  getActivityPhotoByActivityAndPhoto: getActivityPhotoByActivityAndPhoto(
    activityPhotoModel
  ),
  getActivityPhotoByActivity: getActivityPhotoByActivity(activityPhotoModel)
});
