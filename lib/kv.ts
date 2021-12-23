#!/usr/bin/env node

/* eslint-disable no-console */
import {cac} from 'cac';
// @ts-ignore config store has no types I can find.
import ConfigStore from 'configstore';

import {KV} from '.';
import {version, name} from '../package.json';
import {isNumber, isStringEmpty} from './helpers/utils';

// We use a configstore here instead of a local kv because kv needs a mongodb instance.
// So if the user doesnt have a local mongodb instance it wont work.
// This'll do for now untill I add support local key values
const config = new ConfigStore(name, {db: {uri: 'mongodb://localhost:27017/kv'}, namespace: 'kv'});

const cli = cac('kv');

cli.command('settings', 'Set your mongodb configuration')
    .option('--uri <string>', 'MongoDB connect uri (default localhost/kv')
    .option('--namespace <string>', 'set a default namespace (default: kv')
    .action(async flags => {
        if (flags.uri) config.set('db.uri', flags.uri);
        if (flags.namespace) config.set('namespace', flags.namespace);

        endCommand('Settings updated');
    });

cli.command('set [key] [value] [TTL]', 'set a key value')
    .option('--namespace [string]', 'Overwrite default namespace')
    .action(async (key, value, TTL, flags) => {
        if (isStringEmpty(key) || isStringEmpty(value)) {
            return console.log('> Supply a key and a value.');
        }

        const ttl = TTL && isNumber(TTL) ? TTL : null;

        const namespace = getNamespace(flags.namespace);

        const kv = new KV(config.get('db.uri'), namespace);

        await kv.set(key, value, ttl);

        endCommand(`${key} added with value ${value}`);
    });

cli.command('get [key]', 'get a value')
    .option('--namespace [string]', 'Overwrite default namespace')
    .action(async (key, flags) => {
        if (isStringEmpty(key)) {
            return console.log('> Supply a key.');
        }

        const namespace = getNamespace(flags.namespace);
        const kv = new KV(config.get('db.uri'), namespace);

        const value = await kv.get(key);

        if (value) return endCommand(`${key} has value of ${value}`);

        endCommand(`key: ${key} doesn't exist in this namespace/db.`);
    });

cli.command('delete', 'delete a key')
    .option('--namespace [string]', 'Overwrite default namespace')
    .action(async (key, flags) => {
        const namespace = getNamespace(flags.namespace);
        const kv = new KV(config.get('db.uri'), namespace);

        await kv.delete(key);

        endCommand(`${key} deleted`);
    });

cli.command('clear', 'clear a namespace')
    .option('--namespace [string]', 'Overwrite default namespace')
    .action(async flags => {
        const namespace = getNamespace(flags.namespace);
        const kv = new KV(config.get('db.uri'), namespace);

        await kv.clear();

        endCommand(`${namespace} cleared`);
    });

const getNamespace = (namespace: string): string => (isStringEmpty(namespace) ? config.get('namespace') : namespace);
const endCommand = (output: string): void => {
    console.log(`> ${output}`);
    process.exit(0);
};

cli.version(version);
cli.help();
cli.parse();
