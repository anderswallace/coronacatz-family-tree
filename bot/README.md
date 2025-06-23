# About

The Family Tree Bot is a Discord bot that is in charge of maintaining the connections between server members in a 'who invited who' Family Tree. It can add connections, track name changes, and remove members from the tree when they leave or are kicked from the server. It tracks these changes in a PostgreSQL database, which stores realtime information about all the members and their connections.

## Usage

When using the bot in a server, simply type `Please add @User1 to @User2` in the specified channel the bot is listening in, and it will create a connection between those two users, where User1 is a descendant of User2.

If you are unsure of how to format the message, use the `/help` command to get a reminder of the format the bot is expecting to add a connection to the tree.

All other events are automatically tracked by the bot, and no input or interaction is necessary.

## Getting Started

### Installation

Clone the repo and install dependencies:
```shell
git clone https://github.com/anderswallace/coronacatz-family-tree
cd bot
npm install
```

### Initial Setup

The bot requires a few secrets to run (see `.env.example` for what values are expected). Follow [these](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) steps to set up a bot application with Discord, and receive credentials for it to run in a server. Make sure to enable Privileged Intents (Guild Members, Message Content) for the bot to work properly.

This bot is configured to run on PostgreSQL. We highly recommend [Supabase](https://supabase.com/) for local development and production, but any local or cloud Postgres instance will work. Choose your favorite provider and include the connection string in the `.env` file.

### Database

This bot utilizes [Primsa ORM](https://www.prisma.io/orm) to provide a powerful client to interact with our database. Make sure you initialize the client and apply dev migrations:
```shell
npx prisma generate
npx prisma migrate dev --name init
```

This will create the client with the current schema in `prisma/schema.prisma`. When you are ready to move to production, apply them to your production DB:
```shell
npx prisma migrate deploy
```

Additionally, the bot functionality assumes there are already existing users in the database. When you're ready to start using the bot, make sure to seed the database, either with a seeding function for your specific data shape (our Family Tree ended up being a [unicyclic graph](https://en.wikipedia.org/wiki/Pseudoforest#Definitions_and_structure)), or by manually seeding it. You can use [Prisma Studio](https://www.prisma.io/studio) to edit the table manually.

### Running Bot Locally

This repo has included a dev container setup, with a dev environment and OpenTelemetry backend containers to collect the exported telemetry data from the bot. To run the bot with telemetry data, use:
```shell
npm run start:otel
```

You can then visit http://localhost:3000 to view the telemetry data in Grafana.

### Deploying the Bot

When you are ready to deploy your bot, there is included a Dockerfile to containerize your application to be deployed in a local or cloud environment of your choice. Check out [/web](/web) for a web app to visualize your server!

## Configuration

This bot currently supports the following Discord events:
* `messageCreate` - to process a non-bot message and add a user relationship
* `guildMemberUpdate` - when users update any part of their server profile, the bot tracks displayName changes and updates the DB
* `guildMemberRemove` - users who leave the server or are kicked are captured in this event, and the bot will remove them from the DB

If you would like to support other events, add an event handler in `/events` and call the handler in `listeners/addListeners.ts`. Add any relevant database methods in `services/database/databaseService.ts`.
