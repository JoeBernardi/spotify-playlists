export const millisecondsToReadableTime = (timeInMilliseconds: number): string => {
	const nearestDurationSecond = 1000 * Math.round(timeInMilliseconds / 1000);
	const durationDate = new Date(nearestDurationSecond);
	const durationHours = durationDate.getUTCHours();
	const durationMinutes = durationDate.getUTCMinutes();
	const durationSeconds = durationDate.getUTCSeconds();
	const readableSeconds = (durationSeconds < 10 ? "0" : "") + durationSeconds;

	return (durationHours ? `${durationHours}:` : "" ) + `${durationMinutes}:${readableSeconds}`;
};

export default {
	millisecondsToReadableTime,
};
