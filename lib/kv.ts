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
    .example('kv settings --uri mongodb://localhost:27017/kv --namespace test')
    .action(async flags => {
        if (flags.uri) config.set('db.uri', flags.uri);
        if (flags.namespace) config.set('namespace', flags.namespace);

        endCommand('Settings updated');
    });

cli.command('set [key] [...value]', 'set a key value')
    .option('--ttl [string]', 'Set a TTL [Optional]')
    .option('--namespace [string]', 'Overwrite default namespace ( This does not overwrite your global settings')
    .example('kv set location The Netherlands --namespace testing --ttl 300')
    .action(async (key, value, flags) => {
        if (isStringEmpty(key) || value.length === 0) {
            return console.log('> Supply a key and a value.');
        }

        const parsedValue = value.join(' ');

        const ttl = flags.ttl && isNumber(flags.ttl) ? flags.ttl : null;

        const namespace = getNamespace(flags.namespace);

        const kv = new KV(config.get('db.uri'), namespace);

        await kv.set(key, parsedValue, ttl);

        endCommand(`${key} added with value ${parsedValue}`);
    });

cli.command('get [key]', 'get a value')
    .option('--namespace [string]', 'Overwrite default namespace ( This does not overwrite your global settings')
    .example('kv get location --namespace testing')
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
    .option('--namespace [string]', 'Overwrite default namespace ( This does not overwrite your global settings')
    .example('kv delete location --namespace testing')
    .action(async (key, flags) => {
        const namespace = getNamespace(flags.namespace);
        const kv = new KV(config.get('db.uri'), namespace);

        await kv.delete(key);

        endCommand(`${key} deleted`);
    });

cli.command('clear', 'clear a namespace')
    .option('--namespace [string]', 'Overwrite default namespace ( This does not overwrite your global settings')
    .example('kv delete --namespace testing')
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
