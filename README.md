# Twapi

[![](https://img.shields.io/npm/v/@jourloy/twapi?logo=npm&style=flat-square)](https://www.npmjs.com/package/@jourloy/twapi?activeTab=versions) [![NotReady](https://img.shields.io/badge/Work%20in%20progress!-red?style=flat-square)]()

## Description

Typescript client for Twitch API

## Getting started

### Install

```bash
$ npm i @jourloy/twapi@latest
```

### Usage

#### Import

```typescript
import {Twapi} from "./twapi";
```

#### Create class

```typescript
const twapi = new Twapi(Username, OAuth, [Channels]);
```

- *Username* - Username of bot
- *OAuth* - token with scopes
- Channels - Array of channels for join

#### ON

You can react on events through `.twapiClient`

```typescript
twapi.twapiClient.on(`event`, opt => {});
```

##### Possible events

- *message*. Contain channel name and message text

#### Possible commands

- *announce*. Usage: `twapi.announce(channel, text)`
- *announceblue*. Usage: `twapi.announceblue(channel, text)`
- *announcegreen*. Usage: `twapi.announcegreen(channel, text)`
- *announceorange*. Usage: `twapi.announceorange(channel, text)`
- *announcepurple*. Usage: `twapi.announcepurple(channel, text)`