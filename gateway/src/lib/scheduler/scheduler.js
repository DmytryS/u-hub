import schedule from "node-schedule";

/**
 * Return scheduler service
 * @returns {Scheduler} scheduler service
 */
export default function scheduler() {
  return new Scheduler();
}

/**
 * Job scheduler
 */
export class Scheduler {
  /**
   * Constructs job scheduler
   */
  constructor() {
    this._jobs = [];
  }

  /**
   * Schedules a job
   * @param {Object} sched job schedule
   * @param {Function} callback job callback
   * @returns {Object} job instance
   */
  scheduleJob(sched, callback) {
    var job = schedule.scheduleJob(sched, callback);
    this._jobs.push(job);
    return job;
  }

  /**
   * Stops all running jobs
   */
  stopJobs() {
    this._jobs.forEach(function(job) {
      job.cancel();
    });
    this._jobs = [];
  }
}
