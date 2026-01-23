FROM node:alpine3.23

WORKDIR /app

ADD --chmod=776 https://gist.githubusercontent.com/anonymousc/68b56e985cbc14b1750bf227f32def83/raw/d91bf56452aea3e68bb2f007bc969d5b27b96c3b/Front-EntryPoint.sh /EntryPoint.sh

EXPOSE 5173

ENTRYPOINT ["/EntryPoint.sh"]