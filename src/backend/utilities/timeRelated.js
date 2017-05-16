import moment from 'moment-timezone';

module.exports = {
    currentDatetimeString: currentDatetimeString,
    currentYear: currentYear,
    currentMonth: currentMonth,
    currentDateString: currentDateString,
    firstDateStringOfCurrentMonth: firstDateStringOfCurrentMonth,
    lastDateStringOfCurrentMonth: lastDateStringOfCurrentMonth
};

function currentDatetimeString() { return moment().format('YYYY-MM-DD HH:mm:ss'); }

function currentYear() { return new Date().getFullYear(); }

function currentMonth() { return new Date().getMonth(); }

function currentDateString() { return moment(new Date()).format('YYYY-MM-DD'); }

function firstDateStringOfCurrentMonth() { return moment(new Date(currentYear(), currentMonth(), 1)).format('YYYY-MM-DD'); }

function lastDateStringOfCurrentMonth() { return moment(new Date(currentYear(), currentMonth() + 1, 1)).subtract(1, 'day').format('YYYY-MM-DD'); }
