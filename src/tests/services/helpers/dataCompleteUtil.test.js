const {
  completeStep
} = require('../../../rest/services/helpers/dataCompleteUtil');

describe('Testing completeStep helper', () => {
  it('should update empty dataComplete when step 1 (basic information) is completed', async () => {
    expect(completeStep({ dataComplete: 0, step: 1 })).toEqual(1);
  });
  it('should update dataComplete when step 2 (project details) is completed', async () => {
    expect(completeStep({ dataComplete: 1, step: 2 })).toEqual(3);
  });
  it('should update dataComplete when step 3 (project users) is completed', async () => {
    expect(completeStep({ dataComplete: 3, step: 3 })).toEqual(7);
  });
  it('should update dataComplete when step 4 (project milestones) is completed', async () => {
    expect(completeStep({ dataComplete: 7, step: 4 })).toEqual(15);
  });

  it('should update step 3 (project users) with basic information completed previously', async () => {
    expect(completeStep({ dataComplete: 1, step: 3 })).toEqual(5);
  });

  it('should update step 4 (project users) with basic information completed previosly', async () => {
    expect(completeStep({ dataComplete: 1, step: 4 })).toEqual(9);
  });

  it('should update step 3 (project users) with basic information, project details and project milestones completed previously', async () => {
    expect(completeStep({ dataComplete: 11, step: 3 })).toEqual(15);
  });
});
