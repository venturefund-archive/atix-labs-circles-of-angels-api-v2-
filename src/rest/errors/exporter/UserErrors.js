module.exports = {
  InvalidEmail: {
    message: 'Invalid email',
    statusCode: 400
  },
  InvalidPassword: {
    message: 'Invalid password',
    statusCode: 400
  },
  InvalidUserOrPassword: {
    message: 'Invalid user or password',
    statusCode: 400
  },
  EmailAlreadyInUse: {
    message: 'The email is already in use',
    statusCode: 400
  },
  InvalidToken: {
    message: 'Invalid token',
    statusCode: 400
  },
  ExpiredToken: {
    message: 'The token has expired',
    statusCode: 400
  },
  UserNotFound: {
    message: 'User is not found',
    statusCode: 400
  },
  UserRejected: {
    message: 'User is blocked',
    statusCode: 403
  },
  UserUpdateError: {
    message: 'Unable to update the user'
  },
  UserIsNotOwnerOfProject: {
    message: 'The user is not the project´s owner',
    statusCode: 403
  },
  EmailNotExists: email => ({
    message: `There is no user associated with email ${email}`,
    statusCode: 400
  }),
  UnauthorizedUserRole: role => ({
    message: `User of role ${role} is not allowed to execute this operation`,
    statusCode: 403
  }),
  IsNotProjectCurator: {
    message: 'The user is not a Project Curator',
    statusCode: 403
  },
  IsNotSupporter: {
    message: 'The user is not a Supporter',
    statusCode: 403
  },
  minimunCharacterPassword: {
    message: 'Password must have at least 8 characters',
    statusCode: 400
  },
  upperCaseCharacterPassword: {
    message: 'Password must have at least 1 uppercase character',
    statusCode: 400
  },
  lowerCaseCharacterPassword: {
    message: 'Password must have at least 1 lowercase character',
    statusCode: 400
  },
  numericCharacterPassword: {
    message: 'Password must have at least 1 numeric character',
    statusCode: 400
  },
  NotAllowSignUpAdminUser: {
    message: 'It is not allowed to create users with admin role',
    statusCode: 403
  },
  NotConfirmedEmail: {
    message: 'The user needs to confirm email address',
    statusCode: 403
  },
  MnemonicNotEncrypted: {
    message: 'Mnemonic could not be encrypted',
    statusCode: 500
  },
  MnemonicNotDecrypted: {
    message: 'Mnemonic could not be decrypted',
    statusCode: 500
  },
  UndefinedUserForOwnerId: {
    message: 'Undefined user for provided ownerId',
    statusCode: 500
  }
};
