# Recollect
Recollect - collect operational insights using RabbitMQ and ElasticSearch

## Install
```bash
npm install
```

## Configure
Application is configured through environment variables (acording to [The 12-Factor App](https://12factor.net/config)) methodology.  
Following envs are required

Name             | Description                  | Example Value
:---             | :---                         | :---
`APP_PORT`       | App's http port              | 3000
`RABBITMQ_URL`   | RabbitMQ url                 | amqp://rabbitmq
`QUEUE_NAME`     | RabbitMQ queue name          | event
`BASE_QUEUE_NAME`| RabbitMQ base queues names   | recollect
`ES_URL`         | ElasticSearch url            | http://elasticsearch
`ES_INDEX`       | ElasticSearch index name     | recollect

You can store all those envs in a file, and then export all of them at once:
```bash
export $(cat config.env)
```

## Run

#### NPM
```bash
npm run build
```
```bash
npm run api
```
```bash
npm run consumer
```

#### docker-compose
```bash
docker-compose up -d
```
