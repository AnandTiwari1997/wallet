build:
	echo "Building Backend..."
	npm run build

push:
	echo "Building Docker Image..."
	docker build -t wallet-backend .
	echo "Tagging Image..."
	docker tag wallet-backend $(REGISTRY)/wallet-backend
	echo "Pushing Tagged Image..."
	docker push $(REGISTRY)/wallet-backend

deploy:
	echo "Kubernetes Deployment Restarted..."
	kubectl rollout restart deploy/wallet-backend-deployment