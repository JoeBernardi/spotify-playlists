const pad = (n:number) => n < 10 ? `0${n}` : n;

export const millisecondsToReadableTime = (timeInMilliseconds: number, sentence: boolean = false): string => {
	const convertSeconds = 1000;
	const convertMinutes = 60 * convertSeconds;
    const convertHours = 60 * convertMinutes;
    const convertDays = 24 * convertHours;
    const days = Math.floor(timeInMilliseconds / convertDays);
    const hours = Math.floor((timeInMilliseconds - days * convertDays) / convertHours);
    const minutes = Math.round((timeInMilliseconds - days * convertDays - hours * convertHours) / convertMinutes);
    const seconds = Math.floor((timeInMilliseconds % convertMinutes) / 1000)

	if (sentence) {
		return `${days} days, ` + (hours ? `${hours} hours, ` : "" ) + `${minutes} minutes, and ${seconds} seconds`;
	}

	return (hours ? `${pad(hours)}:` : "" ) + `${pad(minutes)}:${pad(seconds)}`;
};

export default {
	millisecondsToReadableTime,
};
