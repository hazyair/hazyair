'use strict';

module.exports = function(value, decimals = 0) {

    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);

};
