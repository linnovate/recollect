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
ENV MAIL_SERVICE=
ENV MAIL_HOST=
ENV MAIL_PORT=587
ENV MAIL_AUTH_USER=
ENV MAIL_AUTH_PASSWORD=
RUN npm install
RUN npm run build
EXPOSE 3005
