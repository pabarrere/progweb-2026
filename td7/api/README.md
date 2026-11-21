## Dockers

### Docker Network
```sh
docker network create contacts-net
```

### MongoDB Docker
```sh
docker run --name mongodb --network contacts-net -d mongo
```

### Contacts API Docker

#### Build contacts-api image
```sh
docker build -t contacts-api .
```

#### Launch contacts container:
```sh
docker run \
    --name contacts \
    -v $(pwd)/src:/app/src \
    --network contacts-net \
    -e MONGO_URI=mongodb://mongodb:27017 \
    -e DB_NAME=td7 \
    -p 3000:80 \
    -d contacts
```

### Launch Multiple Dockers using Docker Compose

#### Build dev images :
```sh
docker compose -f compose.dev.yaml build --no-cache
```

#### Build dev containers :
```sh
docker compose -f compose.dev.yaml up -d
```
OR only build MongoDB and Redis containers and run server in the terminal :
```sh
docker compose -f compose.dev.yaml up -d mongodb redis
npm run dev
```

#### Check containers :
```sh
docker compose -f compose.dev.yaml ps -a
```
OR
```sh
docker ps -a
```

#### Delete dev containers, networks & volumes :
```sh
docker compose -f compose.dev.yaml down -v
```
