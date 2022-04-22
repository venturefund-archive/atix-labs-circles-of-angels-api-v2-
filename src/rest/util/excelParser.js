const XLSX = require('xlsx');
const { remove, invert } = require('lodash');
const logger = require('../logger');
const COAError = require('../errors/COAError');
const errors = require('../errors/exporter/ErrorExporter');
const { xlsxConfigs } = require('../util/constants');

exports.readExcelData = data => {
  let workbook;
  logger.info('[ExcelParser] :: Reading Milestone excel');
  try {
    workbook = XLSX.read(data, { raw: true });
  } catch (err) {
    logger.error('[ExcelParser] :: Error reading excel file:', err);
    throw new COAError(errors.milestone.ErrorProcessingMilestonesFile);
  }

  if (!workbook) {
    logger.error('[ExcelParser] :: Error reading Milestone excel file');
    throw new COAError(errors.milestone.ErrorProcessingMilestonesFile);
  }

  const sheetNameList = workbook.SheetNames;
  const worksheet = workbook.Sheets[sheetNameList[0]];

  const nameMap = invert({ ...xlsxConfigs.keysMap });

  delete worksheet['!autofilter'];
  delete worksheet['!merges'];
  delete worksheet['!margins'];
  delete worksheet['!ref'];

  const cellKeys = Object.keys(worksheet);
  remove(cellKeys, k => k.slice(1) <= xlsxConfigs.startRow);

  return {
    worksheet,
    cellKeys,
    nameMap
  };
};
