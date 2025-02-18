#/bin/sh!
PARAM=$1

if [ "$PARAM" != "--run-only" ]; then
  echo "Building Backend..."
  npm run build
  echo "Building Docker Image..."
  docker build -t wallet-frontend .
fi
#echo "Removing Running Container..."
#docker rm $(docker stop $(docker ps -a -q --filter ancestor=wallet-frontend))
if [ "$PARAM" != "--build-only" ]; then
  echo "Starting New Container..."
  docker run -d \
      -p 3000:80 \
      -e BACKEND_HOST=172.17.0.2 \
      -e BACKEND_PORT=8000 \
      --name wallet-frontend \
      --expose 80 \
      wallet-frontend
 fi