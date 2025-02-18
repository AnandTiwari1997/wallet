#/bin/sh!
PARAM=$1

if [ "$PARAM" != "--run-only" ]; then
  echo "Building Backend..."
  npm run build
  echo "Building Docker Image..."
  docker build -t wallet-backend .
fi
#echo "Removing Running Container..."
#docker rm $(docker stop $(docker ps -a -q --filter ancestor=wallet-backend))
if [ "$PARAM" != "--build-only" ]; then
  echo "Starting New Container..."
  docker run -d \
   -e START_MAIL_SERVER=true \
   -e MAIL_PASSWORD=xjxmpiwwiiebzkwr \
   -e DB_USER_PWD=postgres \
   -e PF_PASSWORD=JaiShreeRam@2024 \
   -e MF_PASSWORD=Anand@1997 \
   -e DB_HOST=172.17.0.4 \
   -e PORT=8000 \
   -e MAIL_USER=anandtiwari887@gmail.com \
   -e MAIL_HOST=imap.gmail.com \
   -e MAIL_SERVER_NAME=imap.gmail.com \
   -e MAIL_PORT=993 \
   -e DB_NAME=wallet \
   -e DB_PORT=5432 \
   -e DB_USER=postgres \
   -e DB_POOL_SIZE=10 \
   -e DB_LOGGING_ENABLED=false \
   -e PF_USERNAME=101563804709 \
   -e MF_EMAIL=anandtiwari887@gmail.com \
   -e MF_PAN_NO=AWDPT2993E \
   --name wallet-backend \
   --expose 8000 \
   wallet-backend
 fi