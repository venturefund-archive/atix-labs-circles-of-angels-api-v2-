/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const savePhoto = photoModel => async photo => {
  const createdPhoto = await photoModel.create({ ...photo });
  return createdPhoto;
};

const getPhotoById = photoModel => async id => {
  const photo = await photoModel.findOne({ id });
  return photo;
};

const updatePhoto = photoModel => async (photoId, path) => {
  const photo = await photoModel.updateOne({ id: photoId }).set({ path });
  return photo;
};

const deletePhoto = photoModel => async photoId => {
  const deletedPhoto = await photoModel.destroyOne({ id: photoId });
  return deletedPhoto;
};

module.exports = photoModel => ({
  savePhoto: savePhoto(photoModel),
  getPhotoById: getPhotoById(photoModel),
  updatePhoto: updatePhoto(photoModel),
  deletePhoto: deletePhoto(photoModel)
});
