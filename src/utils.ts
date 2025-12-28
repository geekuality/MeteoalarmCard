import { MeteoalarmEventType, MeteoalarmLevelType } from './types';

export class Utils {
	/**
	 * Check if current frontend is installed on specified version on higher
	 * This can be used to display some features only on newer version of HA
	 */
	public static minHAversion(minYear: number, minMonth: number): boolean {
		const rawVersion = (window as any).frontendVersion as string;
		if (!rawVersion) return false;
		const year = rawVersion.substring(0, 4);
		const version = rawVersion.substring(4, 6);
		return Number(year) >= minYear || (Number(year) >= minYear && Number(version) >= minMonth);
	}

	/**
	 * Handfuls of integrations use words to describe event severity like
	 * "Moderate" or "Severe". This is an fallback function that can be used
	 * to get the event severity from this string in case it's not provided
	 * in regular way
	 *
	 * These are mostly rare cases like this one:
	 * https://github.com/MrBartusek/MeteoalarmCard/issues/48
	 *
	 * @param severity severity as string (Minor, Moderate, Severe)
	 * @param overrides optionally provide an list of overrides as object.
	 * For example `{ "Moderate": MeteoalarmLevelType.Orange }`
	 * @returns
	 */
	public static getLevelBySeverity(
		severity: string,
		overrides?: { [key: string]: MeteoalarmLevelType },
	): MeteoalarmLevelType {
		if (overrides && overrides[severity]) {
			return overrides[severity];
		}
		switch (severity) {
			case 'Unknown':
			case 'Minor':
			case 'Moderate':
				return MeteoalarmLevelType.Yellow;
			case 'Severe':
				return MeteoalarmLevelType.Orange;
			case 'High':
			case 'Extreme':
				return MeteoalarmLevelType.Red;
			default:
				throw new Error(`[Utils.getLevelBySeverity] unknown event severity: "${severity}"`);
		}
	}

	/**
	 * Some integrations store their event mapping in key-value dict, this
	 * function convert this list for metadata.monitoredConditions
	 * @param eventTypes eventTypes dict
	 */
	public static convertEventTypesForMetadata(eventTypes: {
		[key: number | string]: MeteoalarmEventType;
	}): MeteoalarmEventType[] {
		return [...new Set(Object.values(eventTypes))];
	}

	/**
	 * Format an ISO datetime string to local time
	 * @param isoString ISO datetime string (e.g., "2025-12-28T09:01:12+02:00")
	 * @returns formatted local time string (e.g., "28.12.2025 09:01")
	 */
	public static formatLocalTime(isoString: string): string {
		try {
			const date = new Date(isoString);
			const day = String(date.getDate()).padStart(2, '0');
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const year = date.getFullYear();
			const hours = String(date.getHours()).padStart(2, '0');
			const minutes = String(date.getMinutes()).padStart(2, '0');
			return `${day}.${month}.${year} ${hours}:${minutes}`;
		} catch (error) {
			return isoString;
		}
	}
}
