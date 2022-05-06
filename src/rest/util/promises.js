/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

module.exports = {
  forEachPromise(items, fn, context) {
    return items.reduce(
      (promise, item) => promise.then(() => fn(item, context)),
      Promise.resolve()
    );
  }
};
