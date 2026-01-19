FROM node:alpine3.23

RUN npm install -g vite

WORKDIR /app

COPY . .

ADD --chmod=776 http://gist.githubusercontent.com/anonymousc/68b56e985cbc14b1750bf227f32def83/raw/34b722effebc3c3d0fdb0c70cbd8ce35925dc341/Front-EntryPoint.sh /EntryPoint.sh

EXPOSE 5438

ENTRYPOINT [ "/EntryPoint.sh" ]