import moment from 'moment-timezone';

export function currentDatetimeString() { return moment(new Date()).format('YYYY-MM-DD HH:mm:ss'); }
export function currentYear() { return new Date().getFullYear(); }
export function currentMonth() { return new Date().getMonth(); }
export function currentDateString() { return moment(new Date()).format('YYYY-MM-DD'); }
export function firstDateStringOfCurrentMonth() { return moment(new Date(currentYear(), currentMonth(), 1)).format('YYYY-MM-DD'); }
export function lastDateStringOfCurrentMonth() { return moment(new Date(currentYear(), currentMonth() + 1, 1)).subtract(1, 'day').format('YYYY-MM-DD'); }
