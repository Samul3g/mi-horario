import { DAY_ORDER, MIN_GAP, START_MIN, END_MIN, toMin } from "./time.js";

export function buildDayLayout(daySessions) {
  const list = daySessions.map((s) => ({ ...s, st: toMin(s.start), en: toMin(s.end) }));
  list.sort((a, b) => a.st - b.st || a.en - b.en);
  const n = list.length;
  const visited = new Array(n).fill(false);
  const adj = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (list[i].st < list[j].en && list[i].en > list[j].st) {
        adj[i].push(j);
        adj[j].push(i);
      }
    }
  }
  const result = new Array(n);
  for (let i = 0; i < n; i++) {
    if (visited[i]) continue;
    const comp = [];
    const queue = [i];
    visited[i] = true;
    while (queue.length) {
      const cur = queue.shift();
      comp.push(cur);
      adj[cur].forEach((nb) => {
        if (!visited[nb]) {
          visited[nb] = true;
          queue.push(nb);
        }
      });
    }
    comp.sort((a, b) => list[a].st - list[b].st || list[a].en - list[b].en);
    const laneEnds = [];
    const laneOf = {};
    comp.forEach((idx) => {
      const st = list[idx].st;
      let placedLane = -1;
      for (let l = 0; l < laneEnds.length; l++) {
        if (laneEnds[l] <= st) {
          placedLane = l;
          break;
        }
      }
      if (placedLane === -1) {
        placedLane = laneEnds.length;
        laneEnds.push(list[idx].en);
      } else {
        laneEnds[placedLane] = list[idx].en;
      }
      laneOf[idx] = placedLane;
    });
    const totalCols = laneEnds.length;
    comp.forEach((idx) => {
      result[idx] = { ...list[idx], lane: laneOf[idx], totalCols };
    });
  }
  return result;
}

export function mergeBusyIntervals(sessions) {
  const sorted = sessions
    .map((s) => ({ start: toMin(s.start), end: toMin(s.end) }))
    .filter((s) => Number.isFinite(s.start) && Number.isFinite(s.end) && s.end > s.start)
    .sort((a, b) => a.start - b.start || a.end - b.end);

  const merged = [];
  sorted.forEach((s) => {
    if (merged.length && s.start <= merged[merged.length - 1].end) {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, s.end);
    } else {
      merged.push({ start: s.start, end: s.end });
    }
  });
  return merged;
}

export function freeGapsFromBusy(merged, minGap = MIN_GAP) {
  const gaps = [];
  let prev = START_MIN;
  merged.forEach((m) => {
    if (m.start - prev >= minGap) gaps.push({ start: prev, end: m.start });
    prev = Math.max(prev, m.end);
  });
  if (END_MIN - prev >= minGap) gaps.push({ start: prev, end: END_MIN });
  return gaps;
}

export function gapsByDay(sessions, minGap = MIN_GAP) {
  const result = {};
  DAY_ORDER.forEach((d) => {
    const daySessions = sessions.filter((s) => s.day === d);
    result[d] = freeGapsFromBusy(mergeBusyIntervals(daySessions), minGap);
  });
  return result;
}

export function findConflicts(sessions) {
  const conflicts = [];
  DAY_ORDER.forEach((d) => {
    const list = sessions.filter((s) => s.day === d);
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];
        const aSt = toMin(a.start);
        const aEn = toMin(a.end);
        const bSt = toMin(b.start);
        const bEn = toMin(b.end);
        if (aSt < bEn && aEn > bSt) {
          conflicts.push({
            day: d,
            start: Math.max(aSt, bSt),
            end: Math.min(aEn, bEn),
            a: a.title,
            b: b.title,
          });
        }
      }
    }
  });
  return conflicts;
}
