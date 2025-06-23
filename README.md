<div align="center">
A real-time Family Tree and Discord bot for the CoronaCatz server
</div>

## About

This project was created to help the CoronaCatz Discord community have an automated and interactive way of keeping track of their members in the server. The bot automates the maintenance of the Family Tree diagram. It adds member relationships, handles username changes and members leaving, and pushes all these changes to a cloud database, which is visually displayed at [coronacatz.com](https://coronacatz.com).

Previously, the Family Tree diagram of the server was completely maintained by a single person. It needed to be generated manually every time a new member joined, and updated periodically to reflect any members changing their display names or leaving the server. This was repetitive and prone to data inacuracies, which lead to the creation of the Family Tree Bot and CoronaCatz website.

## Features

Some features and quality of life improvements include:
* Minimal user interaction. Simply type a formatted message in the `family-tree` channel and the bot will automatically add a user to the Family Tree
* Real-time updates for users changing their display names or leaving the server, ensuring the server and Family Tree are in sync at all times
* Web app with an interactive graph displaying the connections between all server members

## Development Features

If you choose to include the Family Tree Bot in your own server, some developer features you will find included are:
* Logging, tracing, and metric data exported using OpenTelemetry
* A comprehensive CI/CD workflow to run tests using Vitest, build a container image of the Bot, and deploy to GHCR

## Built With
* TypeScript
* React
* Node.js
* Prisma
* Discord.js
