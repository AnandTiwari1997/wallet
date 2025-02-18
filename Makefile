build:
	echo "Building Backend..."
	npm run build

push:
	echo "Building Docker Image..."
	docker build -t wallet-frontend .
	echo "Tagging Image..."
	docker tag wallet-frontend $(REGISTRY)/wallet-frontend
	echo "Pushing Tagged Image..."
	docker push $(REGISTRY)/wallet-frontend

deploy:
	echo "Kubernetes Deployment Restarted..."
	kubectl rollout restart deploy/wallet-frontend-deployment