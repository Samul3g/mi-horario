import { DAY_ORDER, MIN_GAP } from "./time.js";
import { freeGapsFromBusy, mergeBusyIntervals } from "./layout.js";

export function intersectFreeAcrossProfiles(profilesSessions, minGap = MIN_GAP) {
  const result = {};
  DAY_ORDER.forEach((d) => {
    const allDaySessions = profilesSessions.flatMap((sessions) =>
      sessions.filter((s) => s.day === d),
    );
    const unionBusy = mergeBusyIntervals(allDaySessions);
    result[d] = freeGapsFromBusy(unionBusy, minGap);
  });
  return result;
}

export function flattenFreeSlots(freeByDay) {
  return DAY_ORDER.flatMap((day) =>
    (freeByDay[day] ?? []).map((slot) => ({ day, start: slot.start, end: slot.end })),
  );
}
