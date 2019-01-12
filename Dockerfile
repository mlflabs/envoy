
FROM node:10-alpine

WORKDIR /opt/app

ENV PORT=80

# Extras:
RUN apk --update add make python gcc g++

# Globally installed NPMs:
RUN npm install -g nodemon
RUN npm install -g pm2


# logs by default are in logs
RUN mkdir -p logs

# npm start, make sure to have a start attribute in "scripts" in package.json
CMD pm2 --output logs/out.log --error logs/error.log start npm -- start
