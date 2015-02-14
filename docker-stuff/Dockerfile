# DOCKER-VERSION 0.10.0

FROM thecodeite/ubuntu-node-base

# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/

# From here we load our application's code in, therefore the previous docker
# "layer" thats been cached will be used if possible
WORKDIR /opt/app
ADD . /opt/app

ENV PORT 80
EXPOSE $PORT

ENV MONGODB_URL mongodb://localhost:27017/fatt

ENV FREEAGENT_FATT_CLIENT_ID ZnVY2G0fN-ZzL0-XBi7L_g
ENV FREEAGENR_FATT_CLIENT_SECRET 4OdDfW36ONBQug4Y2_3lDw
ENV FREEAGENT_API_URL https://api.sandbox.freeagent.com/v2

ENV GOOGLE_CLIENT_ID 121875671159-tggl2f47e171usdatcn4fnpeabkc6f76.apps.googleusercontent.com
ENV GOOGLE_CLIENT_SECRET TEW03Pw8qcWFXwy0qIAFHWdy
ENV GOOGLE_API_URL https://accounts.google.com/o/oauth2

ENV SITE_NAME http://localhost:4848
ENV SECRECT "this is a secret"

CMD npm start
