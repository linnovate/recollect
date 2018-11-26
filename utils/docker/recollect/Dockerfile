FROM node:6
EXPOSE 3005
WORKDIR /app
COPY . /app/
RUN npm install
ADD wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

ENTRYPOINT ["/wait-for-it.sh", "rabbitmq:5672", "--"]
CMD ["npm run start:dev"]