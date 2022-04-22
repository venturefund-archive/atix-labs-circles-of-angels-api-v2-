/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */
module.exports = {
  async saveProjectExperience(projectExperience) {
    const savedProjectExperience = await this.model.create(projectExperience);
    return savedProjectExperience;
  },

  async getExperiencesByProjectId(projectId) {
    const projectExperiences = await this.model
      .find({
        project: projectId
      })
      .populate('user')
      .populate('photos');
    // useless ORM doesn't allow projection on populates
    const processedExperiences = projectExperiences.map(experience => {
      if (experience.user) {
        const { user } = experience;
        const userProjection = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          email: user.email
        };
        return { ...experience, user: userProjection };
      }
      return experience;
    });
    return processedExperiences;
  }
};
