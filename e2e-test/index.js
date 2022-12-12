require('dotenv').config();
const axios = require('axios');
const { isAxiosError } = require('axios');
const fs = require('fs');
const bunyan = require('bunyan');

const { rolesTypes, evidenceTypes } = require('../src/rest/util/constants');
const {
  connectDb,
  doRequest,
  buildFormData,
  createOrGetAdminWithWallet
} = require('./util');

const logger = bunyan.createLogger({ name: 'e2e test' });
const USER_1_EMAIL = 'user1@mail.com';
const USER_1_PASSWORD = 'User1Password';
const ADMIN_PASSWORD = 'admin';
const CREATE_USER_ENDPOINT = '/users';
const RESET_PASSWORD_ENDPOINT = '/users/me/reset-password';
const USER_PROJECT_ENDPOINT = '/user-project';
const WELCOME_EMAIL_ENDPOINT = '/users/welcome-email';
const LOGIN_ENDPOINT = '/users/login';
const activity1Budget = 1000;
const IMG_PATH = './img.png';
const PDF_PATH = './file.pdf';

const getRoleId = async (pool, roleDescription) => {
  const roleQueryResult = await pool.query(
    'SELECT id FROM public.role WHERE description = $1',
    [roleDescription]
  );
  if (roleQueryResult.rows.length === 0)
    throw new Error(`${roleDescription} role not found`);
  return roleQueryResult.rows[0].id;
};

const main = async () => {
  const pool = await connectDb();
  const user = await createOrGetAdminWithWallet(pool);
  logger.info('User obtained, about to login...');
  const instance = axios.create({
    baseURL: `http://${
      process.env.SERVER_HOST === 'localhost'
        ? '127.0.0.1'
        : process.env.SERVER_HOST
    }:${process.env.SERVER_PORT}/`
  });
  try {
    logger.info('About to check server health');
    await instance.get('/health');
  } catch (error) {
    if (isAxiosError(error) && error.code === 'ECONNREFUSED')
      throw new Error('Server is not running');
  }

  logger.info('About to log in');
  const response = await doRequest(
    instance.post(LOGIN_ENDPOINT, {
      email: user.email,
      pwd: ADMIN_PASSWORD
    }),
    LOGIN_ENDPOINT
  );
  const authToken = response.headers.authorization;
  instance.defaults.headers.common.authorization = authToken;

  const currentDate = new Date();
  const date = `${currentDate.toLocaleTimeString()} - ${currentDate.toLocaleDateString()}`;
  const projectName = `${date} - E2E Test`;
  logger.info(`About to create project with name ${projectName}`);

  const createProjectResponse = await instance.post('/projects', {
    projectName
  });
  const { projectId } = createProjectResponse.data;
  logger.info(
    `Project created with id ${projectId}. About to hit basic-information`
  );
  const basicInformationForm = buildFormData({
    projectName,
    thumbnailPhoto: fs.createReadStream(IMG_PATH),
    location: 'Argentina',
    timeframe: '2',
    timeframeUnit: 'weeks'
  });

  const basicInformationEndpoint = `projects/${projectId}/basic-information`;
  const basicInformationResponse = await doRequest(
    instance.put(basicInformationEndpoint, basicInformationForm, {
      headers: basicInformationForm.getHeaders()
    }),
    basicInformationEndpoint
  );
  if (basicInformationResponse.status !== 200) {
    throw new Error('There was an error hitting basic information');
  }
  const detailsForm = buildFormData({
    legalAgreementFile: fs.createReadStream(PDF_PATH),
    projectProposalFile: fs.createReadStream(PDF_PATH),
    additionalCurrencyInformation: '0x12122121',
    currency: 'ETH',
    currencyType: 'Crypto',
    problemAddressed: 'problem',
    mission: 'mission'
  });

  logger.info('About to hit project details endpoint');
  const projectDetailsEndpoint = `projects/${projectId}/details`;
  await doRequest(
    instance.put(projectDetailsEndpoint, detailsForm, {
      headers: detailsForm.getHeaders()
    })
  );
  const auditorRoleId = await getRoleId(pool, rolesTypes.AUDITOR);
  const beneficiaryRoleId = await getRoleId(pool, rolesTypes.BENEFICIARY);

  logger.info('Checking if user 1 exists');
  const getUserEndpoint = `/users?email=${USER_1_EMAIL}`;
  const getUserResponse = await doRequest(
    instance.get(getUserEndpoint),
    getUserEndpoint
  );
  let user1Id;
  if (getUserResponse.data.users.length === 0) {
    logger.info('Creating user 1...');
    const user1Response = await doRequest(
      instance.post(CREATE_USER_ENDPOINT, {
        firstName: 'User 1 Name',
        lastName: 'User 2 Lastname',
        email: USER_1_EMAIL,
        country: 1,
        isAdmin: false
      }),
      CREATE_USER_ENDPOINT
    );
    const { id } = user1Response.data;
    user1Id = id;
    logger.info('About to relate user 1 to the project with auditor role');
    await doRequest(
      instance.post(USER_PROJECT_ENDPOINT, {
        userId: user1Id,
        projectId,
        roleId: auditorRoleId
      }),
      USER_PROJECT_ENDPOINT
    );

    logger.info('Sending welcome email to user 1');
    await doRequest(
      instance.post(WELCOME_EMAIL_ENDPOINT, { userId: user1Id, projectId }),
      WELCOME_EMAIL_ENDPOINT
    );

    logger.info('About to reset password of user 1...');
    const result = await pool.query(
      'SELECT token FROM public.pass_recovery WHERE "email" = $1 ORDER BY ID DESC LIMIT 1',
      [USER_1_EMAIL]
    );
    if (result.rows.length === 0) throw new Error('Couldnt get user 1 token');
    const user1Token = result.rows[0].token;
    await doRequest(
      instance.put(RESET_PASSWORD_ENDPOINT, {
        token: user1Token,
        password: USER_1_PASSWORD
      }),
      RESET_PASSWORD_ENDPOINT
    );
  } else {
    user1Id = getUserResponse.data.users[0].id;
  }

  logger.info('About to relate user 1 to the project with beneficiary role');
  await doRequest(
    instance.post(USER_PROJECT_ENDPOINT, {
      userId: user1Id,
      projectId,
      roleId: beneficiaryRoleId
    }),
    USER_PROJECT_ENDPOINT
  );

  logger.info(
    'About to relate user 1 to the project with auditor role ',
    auditorRoleId
  );
  await doRequest(
    instance.post(USER_PROJECT_ENDPOINT, {
      userId: user1Id,
      projectId,
      roleId: auditorRoleId
    }),
    USER_PROJECT_ENDPOINT
  );
  logger.info('About to create milestone');
  const milestoneEndpoint = `/projects/${projectId}/milestones`;
  const milestoneResponse = await doRequest(
    instance.post(milestoneEndpoint, {
      title: `${date} - Milestone Test`,
      description: 'description'
    }),
    milestoneEndpoint
  );

  const { milestoneId } = milestoneResponse.data;
  const activityEndpoint = `/milestones/${milestoneId}/activities`;

  const activityTitlePrefix = `${date} - Activity Test`;
  const activityCommonFields = {
    auditor: user1Id,
    description: 'description',
    acceptanceCriteria: 'criteria'
  };
  logger.info('About to add activity 1');
  const activity1Response = await doRequest(
    instance.post(activityEndpoint, {
      title: activityTitlePrefix,
      budget: activity1Budget.toString(),
      ...activityCommonFields
    }),
    activityEndpoint
  );
  const { activityId: activity1Id } = activity1Response.data;

  logger.info('About to add activity 2');
  await doRequest(
    instance.post(activityEndpoint, {
      title: `${activityTitlePrefix}2`,
      budget: activity1Budget.toString(),
      ...activityCommonFields
    }),
    activityEndpoint
  );

  logger.info('About to add activity 3');
  const activity3Response = await doRequest(
    instance.post(activityEndpoint, {
      title: `${activityTitlePrefix}3`,
      budget: activity1Budget.toString(),
      ...activityCommonFields
    }),
    activityEndpoint
  );
  const { activityId: activity3Id } = activity3Response.data;

  logger.info('About to delete activity 3');
  const deleteActivityEndpoint = `/activities/${activity3Id}`;
  await doRequest(
    instance.delete(deleteActivityEndpoint),
    deleteActivityEndpoint
  );

  logger.info('Getting project');
  const getProjectEndpoint = `/projects/${projectId}`;
  const getProjectResponse = await doRequest(instance.get(getProjectEndpoint));

  logger.info(
    'Checking if goal amount of project equals sum of activities amount'
  );
  if (getProjectResponse.data.budget !== (activity1Budget * 2).toString()) {
    throw new Error('Project amount differs from activities amount');
  }
  logger.info('About to publish project');
  const publishProjectEndpoint = `/projects/${projectId}/publish`;
  await doRequest(
    instance.put(publishProjectEndpoint, {
      headers: 'Content-Type: application/json'
    }),
    publishProjectEndpoint
  );

  logger.info('About to login with user 1');
  const user1LoginResponse = await doRequest(
    instance.post(LOGIN_ENDPOINT, {
      email: USER_1_EMAIL,
      pwd: USER_1_PASSWORD
    }),
    LOGIN_ENDPOINT
  );
  instance.defaults.headers.common.authorization =
    user1LoginResponse.headers.authorization;

  logger.info('About to add evidence to task 1');
  const evidenceForm = buildFormData({
    title: `${date} - Evidence test`,
    description: 'description',
    type: evidenceTypes.IMPACT,
    amount: activity1Budget,
    transferTxHash: 'txHash',
    file1: fs.createReadStream(PDF_PATH)
  });
  const addEvidenceEndpoint = `activities/${activity1Id}/evidence`;
  await doRequest(
    instance.post(addEvidenceEndpoint, evidenceForm, {
      headers: evidenceForm.getHeaders()
    }),
    addEvidenceEndpoint
  );

  logger.info('Test successfully ran');
  process.exit(0);
};

main();
