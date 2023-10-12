const cron = require('cron');
const job = new cron.CronJob(
	'* * * * * *',
	function () {
		console.log('You will see this message every second');
	},
	null,
	true,
	'America/Los_Angeles'
);

job.start();