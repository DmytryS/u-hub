import schedule from 'node-schedule'

let jobs = []

export default {
  scheduleJob: (sched, callback) => {
    const job = schedule.scheduleJob(sched, callback)
    jobs.push(job)
  },
  stopJobs: () => {
    jobs.forEach(job => {
      job.cancel()
    })
    jobs = []
  }
}