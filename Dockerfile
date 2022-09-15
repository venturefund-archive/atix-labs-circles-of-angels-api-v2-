FROM node:12.21.0


# Setting working directory. All the path will be relative to WORKDIR
WORKDIR /usr/src/app

# Installing dependencies
COPY package.json ./

RUN npm install

# Copying source files
COPY . .

# Building app
RUN npm run build
EXPOSE 3001

# Running the app
CMD [ "npm", "start" ]

