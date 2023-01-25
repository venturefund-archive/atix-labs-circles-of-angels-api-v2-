module.exports = roles => {
  const rolesByProjectMap = roles.reduce(
    (rolesByProject, { project, role }) => ({
      ...rolesByProject,
      [project]: rolesByProject[project]
        ? [...rolesByProject[project], role]
        : [role]
    }),
    {}
  );
  return Object.keys(rolesByProjectMap).map(projectId => ({
    projectId,
    roles: rolesByProjectMap[projectId]
  }));
};
