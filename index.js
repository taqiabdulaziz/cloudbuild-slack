const Slack = require('slack-node');
const config = require('./config.json');

exports.onbuildstatus = (event, callback) => {

  const pubsubMessage = event.data;

  const data = Buffer.from(pubsubMessage.data, 'base64').toString();

  console.info(data);

  const build = JSON.parse(data);
  
  const statusColor = (build) => {
    switch(build.status) {
    case 'SUCCESS':
      return '#36A64F';
    case 'QUEUED':
      return '#B0B0B0';
    case 'WORKING':
      return '#7898FC';
    default:
      return '#B94A4B'
    }
  };

  const downCap = (str) => str.replace(/^(\w)(\w*)/, (m, p1, p2) => p1 + p2.toLowerCase());

  const imageLinks = (images=[]) => images.map(
    image => image.name
  );

  const titleName = (source) => (source.repoSource) ?
        source.repoSource.repoName :
        source.storageSource.object;

  const titleMeta = (source) => (source.repoSource) ?
        source.repoSource.branchName :
        source.storageSource.bucket;

  const title = ({ source, status }) =>
        `[${downCap(status)}] ${titleName(source)} (${titleMeta(source)})`;
  
  const body = ({ status, results, logUrl }) => (status === 'SUCCESS') ?
        `${imageLinks(results.images).join('\n')}` :
        `<${logUrl} | View Build>`;

  const duration = (milli) => {
    const seconds = Math.floor((milli / 1000) % 60);
    const minutes = (Math.floor((milli / (60 * 1000)) % 60));
    const dur = (minutes) ? `${minutes} min ${seconds} sec` : `${seconds} sec`;
    return dur;
  }

  const fallback = (build) => build.status;

  const footer = (build) => (['WORKING', 'QUEUED', 'STATUS_UNKNOWN'].includes(build.status)) ?
                             null :
                             duration(new Date(build.finishTime) - new Date(build.startTime));

  const options = {
    channel: `#${config.SLACK_CHANNEL}`,
    username: config.SLACK_USERNAME,
    text: null,
    attachments: [{
      fallback: fallback(build),
      color: statusColor(build),
      title: title(build),
      text: body(build),
      footer: footer(build)
    }]
  };

  const webhookUri = config.SLACK_WEBHOOK_URL;
 
  slack = new Slack();
  slack.setWebhook(webhookUri);
  slack.webhook(options, function (err, response) {
    callback(err, response);
  });
};
