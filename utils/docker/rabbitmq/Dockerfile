FROM rabbitmq:3.6.15-management
RUN apt-get update; apt-get install -y unzip
COPY rabbitmq_delayed_message_exchange-20171215-3.6.x.ez /plugins
RUN rabbitmq-plugins enable rabbitmq_delayed_message_exchange --offline