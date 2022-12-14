module.exports = {
  RolesUserError: user => ({
    message: `Error getting roles of user: ${user}`,
    statusCode: 500
  })
};
