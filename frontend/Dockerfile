FROM node:alpine3.23

WORKDIR /app

# COPY . .

ADD --chmod=776 https://gist.githubusercontent.com/anonymousc/68b56e985cbc14b1750bf227f32def83/raw/efa8821a0fabe5d8551e0a26098c8d5699cc56a4/Front-EntryPoint.sh /EntryPoint.sh

ENTRYPOINT [ "/EntryPoint.sh" ]