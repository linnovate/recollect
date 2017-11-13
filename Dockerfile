FROM node:6
WORKDIR /usr/src/app
COPY . /usr/src/app
ENV PORT=3005
ENV RABBITMQ_URL=amqp://rabbitmq
ENV QUEUE_NAME=recollect-index
ENV ES_URL=http://elasticsearch:9200
ENV ES_INDEX=recollect-events
ENV BASE_QUEUE_NAME=recollect
ENV RULES_API=http://rules-api:4040/api/rules
#RUN npm install
EXPOSE 3005