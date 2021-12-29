# KV

<span class="badge-npmversion"><a href="https://www.npmjs.com/package/@qgisk/kv" title="View this project on NPM"><img src="https://img.shields.io/npm/v/@qgisk/kv.svg" alt="NPM version"/></a></span>
<span class="badge-npmdownloads"><a href="https://www.npmjs.org/package/@qgisk/kv" title="View this project on NPM"><img src="https://img.shields.io/npm/dm/@qgisk/kv.svg" alt="NPM downloads" /></a></span>

## About

KV is a simple MongoDB based key value store.

If you're looking for a key value library that supports more than just MongoDB checkout [keyv](https://github.com/jaredwray/keyv)

If you're looking for a CLI checkout [this](https://github.com/qgisk/kv-cli)

## Installation

```bash
npm i @qgisk/kv mongoose
```

## Example

Simple quick start example

```javascript
import {KV} from '@qgisk/kv';
// or for commonjs
const {KV} = require('@qgisk/kv');

// First value is the mongodb uri, the second is your namespace.
// db uri defaults to mongodb://localhost:27017/kv
// namespace defaults to 'kv'
const kv = new KV('uri', 'namespace');

await kv.set('key', 'value');

await kv.get('key'); // value
```

## Multiple namespaces

Using multiple namespaces so you dont get conflicts

```javascript
const users = new KV(undefined, 'users');
const posts = new KV(undefined, 'posts');

await users.set('one', 'user');
await posts.set('one', 'post');

await users.get('one'); // user
await posts.get('one'); // post
```

## All values in namespace

Easily get all values in a namespace

```javascript
const users = new KV(undefined, 'users');

await users.set('one', 'user');
await users.set('two', 'user');

await users.all(); // [{key: 'users:one', value: 'user'}, {key: 'users:two', value: 'user'}]
```

## Delete a key

Delete key in your current namespace

```javascript
const users = new KV(undefined, 'users');

await users.del('one', 'user');

await users.get('one'); // undefined
```

## Clear a namespace

Clear a whole namespace

```javascript
const users = new KV(undefined, 'users');

await users.set('one', 'user');
await users.clear();

await users.get('one'); // undefined
```

## Mongoose error events

```javascript
const kv = new KV('mongodb://123/');

kv.on('error', e => console.log(e));
```

## TTL

```javascript
const kv = new KV(undefined, 'ttl');

await kv.set('test', 'hi', 5000); // 5 seconds
setTimeout(() => console.log(await kv.get('test')), 5000); // undefined
```

[MIT](https://github.com/QGIsK/kv/blob/main/LICENSE) Demian
