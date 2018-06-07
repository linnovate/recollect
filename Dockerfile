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
ENV MAIL_SERVICE=office365
ENV MAIL_HOST=smtp.office365.com
ENV MAIL_PORT=587
ENV MAIL_AUTH_USER=booking@danhotels.onmicrosoft.com
ENV MAIL_AUTH_PASSWORD=Linn3933
RUN npm install
RUN npm run build
EXPOSE 3005