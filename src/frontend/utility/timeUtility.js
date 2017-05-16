import moment from 'moment-timezone';

export function currentDateTime() {
    return moment(new Date().getTime());
}
