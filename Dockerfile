FROM node:10-alpine

WORKDIR /src
ENV NODE_ENV production

# run cusom script
RUN echo 'sh /src/test.sh' >> /usr/bin/start.sh
RUN echo 'sh /src/config_scripts/settings.sh' >> /usr/bin/start.sh


RUN npm install -g pm2
RUN echo 'npm install --production' >> /usr/bin/start.sh

# npm start, make sure to have a start attribute in "scripts" in package.json
RUN echo 'pm2 --max-memory-restart=80M --output logs/out.log --error logs/error.log start npm -- start' >> /usr/bin/start.sh



# make sure it always wait
RUN echo 'sh' >> /usr/bin/start.sh

ENV PRODUCTION true
CMD ["/src/bin/www"]

