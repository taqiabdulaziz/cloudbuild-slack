#! /bin/bash

echo "Enter slack incoming webhook URL:"
read slack_webhook_url
echo "Enter slack channel name (without #):"
read slack_channel
echo "Enter slack bot username:"
read slack_username

echo "{ \
\"SLACK_WEBHOOK_URL\": \"${slack_webhook_url}\",\
\"SLACK_CHANNEL\": \"${slack_channel}\",\
\"SLACK_USERNAME\": \"${slack_username}\"\
}" > config.json
