# imigz
   imigz is an image sharing and image hosting service
  
## Details

### Features
  - Create users and update their information
  - Github auth (Sign in/Sign up with github)
  - Upload Media (png, jpeg, gif)
  - Storing media in S3 and serving them via Cloudfront
### Infrastructure 
![imigz infrastrucutre](infrastructure.png "Infrastrucutre")
## Setup Dev enviroment
```bash
  npm install
  docker-compose up -d
  npm run migrate:latest
```
## Run app 
```bash
  npm run build
  npm run start
  # or
  npm run dev
```
## Run tests

```bash
  # Make sure first that containers are up and latest migration is done
  npm run test
```
