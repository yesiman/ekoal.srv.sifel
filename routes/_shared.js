var moment = require('moment-timezone');
function getReunionLocalDate()
{
    return new Date(moment.tz(new Date().getTime(),"Indian/Reunion").format("MMM DD, YYYY HH:mm:SS"));
};

module.exports = {
    getReunionLocalDate: getReunionLocalDate
};