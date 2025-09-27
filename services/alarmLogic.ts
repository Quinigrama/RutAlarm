
import type { Business, Alarm, AppConfig } from '../types';

function normalizeTime(timeStr: string): string {
    if (!timeStr) return '';
    let normalized = timeStr.replace(/h/g, ':').replace(/\./g, ':');
    const parts = normalized.split(':');
    if (parts.length >= 2) {
        const hours = parts[0].padStart(2, '0');
        const minutes = parts[1].padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    return timeStr;
}

function extractAddressFromLine(line: string): string | null {
    let cleaned = line.replace(/\d{1,2}[:\.]?\d{2}\s*[-–]\s*\d{1,2}[:\.]?\d{2}/g, '');
    cleaned = cleaned.replace(/>>>/g, '').replace(/\s+/g, ' ').trim();
    return cleaned.length > 5 ? cleaned : null;
}

function extractBusinessName(addressStr: string): string {
    const parts = addressStr.split(',');
    let name = parts[0].trim();
    if (name.length < 10 && parts.length > 1) {
        name = `${parts[0]}, ${parts[1]}`;
    }
    return name.trim();
}

function buildScheduleString(foundTimes: {start: string; end: string}[]): string {
    return foundTimes.map(ft => `${ft.start} - ${ft.end}`).join(' / ');
}

function parseTimeToMinutes(timeStr: string): number {
    if (!timeStr || !timeStr.includes(':')) return 0;
    const parts = timeStr.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

function determineClosingType(foundTimes: {start: string; end: string}[]): 'midday' | 'final' | 'continuous' {
    if (foundTimes.length > 1) {
        return 'midday';
    }
    if (foundTimes.length === 1) {
        const start = parseTimeToMinutes(foundTimes[0].start);
        const end = parseTimeToMinutes(foundTimes[0].end);
        const duration = end > start ? end - start : (24 * 60 - start) + end; // Handles overnight schedules
        if (duration > 600) { // More than 10 hours
            return 'continuous';
        }
    }
    return 'final';
}


export const parseAddressesWithSchedules = (text: string): Business[] => {
    const businesses: Business[] = [];
    const lines = text.split('\n').filter(line => line.trim().length > 10);

    lines.forEach(line => {
        const trimmedLine = line.trim();
        const timePatterns = [
            /(\d{1,2}:\d{2}(?::\d{2})?)\s*-\s*(\d{1,2}:\d{2}(?::\d{2})?)/g,
            /(\d{1,2}\.\d{2})\s*-\s*(\d{1,2}\.\d{2})/g,
            /(\d{1,2}h\d{2})\s*-\s*(\d{1,2}h\d{2})/g,
            /de\s+(\d{1,2}:\d{2})\s+a\s+(\d{1,2}:\d{2})/gi
        ];
        
        const foundTimes: { start: string; end: string }[] = [];
        timePatterns.forEach(pattern => {
            let matches;
            while ((matches = pattern.exec(trimmedLine)) !== null) {
                foundTimes.push({
                    start: normalizeTime(matches[1]),
                    end: normalizeTime(matches[2])
                });
            }
        });

        if (foundTimes.length > 0) {
            const addressPart = extractAddressFromLine(trimmedLine);
            if (addressPart) {
                businesses.push({
                    id: `business-${businesses.length}`,
                    name: extractBusinessName(addressPart),
                    address: addressPart,
                    schedule: buildScheduleString(foundTimes),
                    closingType: determineClosingType(foundTimes),
                    rawLine: trimmedLine,
                    foundTimes: foundTimes
                });
            }
        }
    });

    return businesses;
};

const parseSchedule = (business: Business) => {
    return business.foundTimes.map((ft, index) => ({
        opening: ft.start,
        closing: ft.end,
        isMidday: business.closingType === 'midday' && index === 0,
        isFinal: (business.closingType === 'final' || business.closingType === 'continuous') || (business.closingType === 'midday' && index === 1)
    }));
};

export const generateAlarms = (businesses: Business[], config: AppConfig, currentTime: Date): Alarm[] => {
    const alarms: Alarm[] = [];
    
    businesses.forEach(business => {
        const schedules = parseSchedule(business);
        
        schedules.forEach((schedule, j) => {
            if (schedule.closing) {
                const alarmTime = new Date(currentTime);
                const [hoursStr, minutesStr] = schedule.closing.split(':');
                let hours = parseInt(hoursStr);
                
                const minutesBefore = schedule.isMidday ? config.middayMinutes : config.finalMinutes;
                let minutes = parseInt(minutesStr) - minutesBefore;
                
                if (minutes < 0) {
                    minutes += 60;
                    hours -= 1;
                    if(hours < 0) hours += 24;
                }
                
                alarmTime.setHours(hours, minutes, 0, 0);

                if (alarmTime > currentTime) {
                    alarms.push({
                        id: `${business.id}-${schedule.closing}-${j}`,
                        businessName: business.name,
                        address: business.address,
                        alarmTime: alarmTime,
                        closingTime: schedule.closing,
                        type: schedule.isFinal ? 'final' : 'midday',
                        isMiddayClosing: schedule.isMidday,
                        active: true
                    });
                }
            }
        });
    });

    return alarms.sort((a, b) => a.alarmTime.getTime() - b.alarmTime.getTime());
};
