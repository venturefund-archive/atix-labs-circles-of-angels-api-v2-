const generateNewDataComplete = require('../../../rest/services/helpers/generateNewDataComplete');

describe('Testing generateNewDataComplete helper', () => {
  it('should update empty dataComplete when step 1 (basic information) is completed', async () => {
    expect(
      generateNewDataComplete({ dataComplete: 0, stepCompleted: 1 })
    ).toEqual(1);
  });
  it('should update dataComplete when step 2 (project details) is completed', async () => {
    expect(
      generateNewDataComplete({ dataComplete: 1, stepCompleted: 2 })
    ).toEqual(3);
  });
  it('should update dataComplete when step 3 (project users) is completed', async () => {
    expect(
      generateNewDataComplete({ dataComplete: 3, stepCompleted: 3 })
    ).toEqual(7);
  });
  it('should update dataComplete when step 4 (project milestones) is completed', async () => {
    expect(
      generateNewDataComplete({ dataComplete: 7, stepCompleted: 4 })
    ).toEqual(15);
  });

  it('should update step 3 (project users) with basic information completed previously', async () => {
    expect(
      generateNewDataComplete({ dataComplete: 1, stepCompleted: 3 })
    ).toEqual(5);
  });

  it('should update step 4 (project users) with basic information completed previosly', async () => {
    expect(
      generateNewDataComplete({ dataComplete: 1, stepCompleted: 4 })
    ).toEqual(9);
  });

  it('should update step 3 (project users) with basic information, project details and project milestones completed previously', async () => {
    expect(
      generateNewDataComplete({ dataComplete: 11, stepCompleted: 3 })
    ).toEqual(15);
  });
});
