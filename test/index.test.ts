// @ts-nocheck

import test from 'ava';
import {KV} from '../dist/';

const namespace = 'users';

const key = 'key';
const keySecondary = 'keySecondary';

const value = 'value';
const valueSecondary = 'valueSecondary';

test('create prefix returns correct prefix', async t => {
    const kv = new KV(undefined, namespace);

    const prefix = kv._createPrefix(key);

    t.is(prefix, `${namespace}:${key}`);
});

test('set value returns newly created value', async t => {
    const kv = new KV();
    const keyv = await kv.set(key, value);

    t.true(keyv.key.includes(key));
    t.is(keyv.value, value);
});

test('set value updates value that already exists', async t => {
    const kv = new KV();
    const keyv = await kv.set(key, value);

    t.true(keyv.key.includes(key));
    t.is(keyv.value, value);

    const updatedKeyv = await kv.set(key, valueSecondary);

    t.true(updatedKeyv.key.includes(key));
    t.is(updatedKeyv.value, valueSecondary);
});
