'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const timestamProps = { createdAt: new Date(), updatedAt: new Date() };
    return queryInterface.bulkInsert('Roles', [
      { name: 'ADMIN', ...timestamProps },
      { name: 'VIP', ...timestamProps },
      { name: 'TRAINEE', ...timestamProps },
      { name: 'INVESTOR', ...timestamProps },
    ]);
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
    return queryInterface.bulkDelete('Roles', { name : { $in: ['ADMIN', 'VIP', 'TRAINEE', 'INVESTOR',]}}, {});
  }
};
