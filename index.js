const Slack = require('slack-node');
const config = require('./config.json');

exports.onbuildstatus = function (event, callback) {

  const pubsubMessage = event.data;
  const data = Buffer.from(pubsubMessage.data, 'base64').toString();
  const {
    status,
    statusDetail,
    results,
    source,
    logUrl
  } = JSON.parse(data);
  
  const webhookUri = config.SLACK_WEBHOOK_URL;
 
  slack = new Slack();
  slack.setWebhook(webhookUri);

  const statusColor = (status) => {
    switch(status) {
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

  const title = (source) => (source.bucket) ?
        `[${status}] ${source.object} (${source.bucket})` :
        `[${status}] ${source.repoName} (${source.branchName})`;

  const text = (status) => (status === 'SUCCESS') ?
        `Successfuly built ${results.images.join(' ')}` :
        '';
    
  slack.webhook({
    channel: config.SLACK_CHANNEL,
    username: config.SLACK_USERNAME,
    text: null,
    attachments: [{
      fallback: statusDetail,
      color: statusColor(status),
      pretext: null,
      title: title(source),
      text: text(status),
      footer: logUrl
    }]
  }, function(err, response) {
    callback(err, response);
  });
};
