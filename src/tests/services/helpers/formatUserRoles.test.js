const formatUserRoles = require('../../../rest/services/helpers/formatUserRoles');

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
  describe('Test formatUserRoles method', () => {
    it('should return the same user properties with roles formated', () => {
      expect(formatUserRoles([user])).toMatchObject([
        {
          id: 3,
          firstName: 'Pablo',
          lastName: 'Perez',
          email: 'admin@test.com',
          emailConfirmation: true,
          roles: [
            {
              projectId: 1,
              roles: [1, 2]
            },
            {
              projectId: 2,
              roles: [2]
            }
          ]
        }
      ]);
    });

    it('should return the same user properties because roles field is empty array', () => {
      expect(formatUserRoles([{ ...user, roles: [] }])).toMatchObject([
        {
          id: 3,
          firstName: 'Pablo',
          lastName: 'Perez',
          email: 'admin@test.com',
          emailConfirmation: true,
          roles: []
        }
      ]);
    });
  });
});
