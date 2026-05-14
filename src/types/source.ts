import type { SourceJob } from "./job.js";

export type JobSource = {
  name: string;
  fetchJobs: () => Promise<SourceJob[]>;
};
