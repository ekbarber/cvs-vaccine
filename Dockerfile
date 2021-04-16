FROM node:12
WORKDIR app
COPY ./ .

CMD ./get-data.sh | ./index.js
