const config = require('config');
const projectStatusChangeMailHelper = require('../../../../rest/services/helpers/mail/projectStatusChange');
const { projectStatuses } = require('../../../../rest/util/constants');

describe('Testing projectStatusChange mail helper', () => {
  const project = {
    projectName: 'Test Project',
    id: '1'
  };

  const subtitles = {
    [projectStatuses.REJECTED]: `Project ${
      project.projectName
    } has been rejected`,
    [projectStatuses.PUBLISHED]: `Project ${
      project.projectName
    } has been published`,
    [projectStatuses.CONSENSUS]: `Project ${
      project.projectName
    } has entered the consensus phase`,
    [projectStatuses.FUNDING]: `Project ${
      project.projectName
    } has entered the funding phase`,
    [projectStatuses.EXECUTING]: `Project ${
      project.projectName
    } has entered the executing phase`,
    [projectStatuses.FINISHED]: `Project ${project.projectName} has finished!`,
    [projectStatuses.CHANGING_SCOPE]: `Project ${
      project.projectName
    } is changing its scope`,
    [projectStatuses.ABORTED]: `Project ${
      project.projectName
    } has been aborted`,
    [projectStatuses.CANCELLED]: `Project ${
      project.projectName
    } has been cancelled`,
    [projectStatuses.ARCHIVED]: `Project ${
      project.projectName
    } has been archived`
  };

  const mainTitles = {
    any: 'A project has been updated',
    owner: 'A project you own has been updated',
    follower: 'A project you follow has been updated',
    supporter: 'A project you applied to has been updated'
  };

  const projectDetailUrl = `${config.frontendUrl}/project-detail?id=${
    project.id
  }`;

  const editProjectUrl = `${config.frontendUrl}/create-project?id=${
    project.id
  }`;

  describe('Test getBodyContent method', () => {
    it.each([
      [projectStatuses.REJECTED],
      [projectStatuses.PUBLISHED],
      [projectStatuses.CONSENSUS],
      [projectStatuses.FUNDING],
      [projectStatuses.EXECUTING],
      [projectStatuses.FINISHED],
      [projectStatuses.CHANGING_SCOPE],
      [projectStatuses.ABORTED],
      [projectStatuses.CANCELLED],
      [projectStatuses.ARCHIVED]
    ])('should return the correct subtitle when status is %s', newStatus => {
      const response = projectStatusChangeMailHelper.getBodyContent(
        project,
        newStatus
      );

      const expectedLink =
        newStatus === projectStatuses.REJECTED
          ? editProjectUrl
          : projectDetailUrl;
      expect(response.subTitle).toEqual(subtitles[newStatus]);
      expect(response.linkUrl).toEqual(expectedLink);
      expect(response.buttonUrl).toEqual(expectedLink);
      expect(response.buttonText).toEqual('Go to project!');
      expect(response.mainTitle).toEqual(mainTitles.any);
    });
    it.each([['any'], ['owner'], ['follower'], ['supporter']])(
      'should return the correct mainTitle when recipient is %s',
      recipient => {
        const response = projectStatusChangeMailHelper.getBodyContent(
          project,
          projectStatuses.CONSENSUS,
          recipient
        );
        expect(response.subTitle).toEqual(subtitles[projectStatuses.CONSENSUS]);
        expect(response.linkUrl).toEqual(projectDetailUrl);
        expect(response.buttonUrl).toEqual(projectDetailUrl);
        expect(response.buttonText).toEqual('Go to project!');
        expect(response.mainTitle).toEqual(mainTitles[recipient]);
      }
    );
  });
});
