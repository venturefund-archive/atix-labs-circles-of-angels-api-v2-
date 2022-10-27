const groupRolesByProject = require('./groupRolesByProject');

module.exports = ({ roles, ...rest }) => ({
  ...rest,
  projects: groupRolesByProject(roles)
});
