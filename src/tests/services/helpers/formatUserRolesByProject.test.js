const formatUserRolesByProject = require('../../../rest/services/helpers/formatUserRolesByProject');

describe('Testing formatUserRoles helper', () => {
  const user = {
    id: 3,
    firstName: 'Pablo',
    lastName: 'Perez',
    email: 'admin@test.com',
    emailConfirmation: true,
    roles: [
      {
        project: 1,
        role: 1,
        user: 3
      },
      {
        project: 1,
        role: 2,
        user: 3
      },
      {
        project: 2,
        role: 2,
        user: 3
      }
    ]
  };
  describe('Test formatUserRolesByProject method', () => {
    it('should return the same user properties with roles formated', () => {
      expect(formatUserRolesByProject(user)).toMatchObject({
        id: 3,
        firstName: 'Pablo',
        lastName: 'Perez',
        email: 'admin@test.com',
        emailConfirmation: true,
        projects: [
          {
            projectId: '1',
            roles: [1, 2]
          },
          {
            projectId: '2',
            roles: [2]
          }
        ]
      });
    });

    it('should return the same user properties because roles field is empty array', () => {
      expect(formatUserRolesByProject({ ...user, roles: [] })).toMatchObject({
        id: 3,
        firstName: 'Pablo',
        lastName: 'Perez',
        email: 'admin@test.com',
        emailConfirmation: true,
        projects: []
      });
    });
  });
});
