/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart
 * contracts to develop impact milestones agreed
 * upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { injectMocks } = require('../../rest/util/injection');

jest.mock('../../rest/services/helpers/checkExistence.js');
const countryService = require('../../rest/services/countryService');

describe('Testing countryService', () => {
  let dbCountry = [];

  const countryDao = {
    findAllByProps: filter =>
      dbCountry.filter(country =>
        Object.keys(filter).every(key => country[key] === filter[key])
      )
  };

  describe('Testing countryService getAll', () => {
    beforeAll(() => {
      injectMocks(countryService, { countryDao });
    });

    beforeEach(() => {
      dbCountry = [];
      dbCountry.push({
        id: 1,
        name: 'Argentina'
      });
    });

    it('should get all the countries', async () => {
      const response = await countryService.getAll({});
      expect(response.length).toEqual(dbCountry.length);
    });
  });
  describe('Testing countryService getById', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should get all the countries', async () => {
      const response = await countryService.getCountryById(1);
      expect(response).toBeDefined();
      expect(response).toEqual({
        country: {
          id: 1,
          name: 'Argentina'
        }
      });
    });
  });
});
