module.exports = {
  ImgFileTyPeNotValid: {
    message: 'The image file type is not a valid one',
    statusCode: 400
  },
  MilestoneFileTypeNotValid: {
    message: 'The milestone file type is not a valid one',
    statusCode: 400
  },
  DocFileTypeNotValid: {
    message: 'The document file type is not a valid one',
    statusCode: 400
  },
  EvidenceFileTypeNotValid: {
    message: 'The evidence file type is not a valid one',
    statusCode: 400
  },
  ImgSizeBiggerThanAllowed: {
    // TODO: change name to FileSizeBiggerThanAllowed
    message: 'The file size is bigger than allowed',
    statusCode: 400
  },
  MilestoneTemplateNotExist: {
    message: "Milestone template doesn't exist",
    statusCode: 500
  },
  ErrorReadingMilestoneTemplate: {
    message: 'Error reading milestones template file',
    statusCode: 500
  }
};
