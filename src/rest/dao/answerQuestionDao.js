/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const createQuestionnaireEntry = answerQuestionModel => async questionnaire => {
  const createdEntry = await answerQuestionModel.createEach(questionnaire);
  return createdEntry;
};

const getByUserId = answerQuestionModel => async userId =>
  answerQuestionModel
    .find({ user: userId })
    .populate('answer')
    .populate('question');

module.exports = answerQuestionModel => ({
  createQuestionnaireEntry: createQuestionnaireEntry(answerQuestionModel),
  getByUserId: getByUserId(answerQuestionModel)
});
