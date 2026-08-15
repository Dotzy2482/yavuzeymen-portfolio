/**
 * Public API of the track-records feature.
 *
 * This is the ONLY file the rest of the app may import from. Everything else
 * under `features/track-records/` — components, hooks, data, lib — is internal
 * and free to change without touching a consumer.
 *
 * Exported surface: the <TrackRecords /> component and the types a consumer
 * could plausibly need to talk about. Nothing else.
 */

export { TrackRecords } from './components/TrackRecords';
export type { TrackRecordsProps } from './components/TrackRecords';

export type { Track, TrackId, TrackSeries, SectorSplit } from './data/types';
