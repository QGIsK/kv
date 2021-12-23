// @ts-nocheck

import test from 'ava';
import {KV} from '../dist/';

import {isObject} from '../dist/helpers/utils';

const namespace = 'creation';

const key = 'key';

const value = 'value';
const valueSecondary = 'valueSecondary';

const keyObject = 'keyObject';
const valueObject = {
    foo: 'bar',
};

test('create prefix returns correct prefix', async t => {
    const kv = new KV(undefined, namespace);

    const prefix = kv._createPrefix(key);

    t.is(prefix, `${namespace}:${key}`);
});

test('clean replaces whitespace with dashes and trims off whitespace start/end', t => {
    const kv = new KV(undefined, undefined);

    const cleaned = kv._clean(' hello there ');

    t.is(cleaned, 'hello-there');
});

test('prefix replaces whitespace with dashes', async t => {
    const kv = new KV(undefined, ' hello there ');

    const prefix = kv._createPrefix(' hello there x2 ');

    t.is(prefix, 'hello-there:hello-there-x2');
});

test('set value returns newly created value', async t => {
    const kv = new KV(undefined, namespace);
    const keyv = await kv.set(key, value);

    t.true(keyv.key.includes(key));
    t.is(keyv.value, value);
});

test('set value updates value that already exists', async t => {
    const kv = new KV(undefined, 'duplication');
    const keyv = await kv.set(key, value);

    t.true(keyv.key.includes(key));
    t.is(keyv.value, value);

    const updatedKeyv = await kv.set(key, valueSecondary);

    t.true(updatedKeyv.key.includes(key));
    t.is(updatedKeyv.value, valueSecondary);
});

test('get returns correct value', async t => {
    const kv = new KV(undefined, namespace);

    await kv.set(key, value);

    const keyv = await kv.get(key);

    t.is(keyv, value);
});

test('get returns object', async t => {
    const kv = new KV(undefined, 'object');

    await kv.set(keyObject, valueObject);

    const keyv = await kv.get(keyObject);

    t.assert(isObject(keyv));
    t.assert('foo' in valueObject);
    t.is(valueObject.foo, 'bar');
});

test('delete value', async t => {
    const kv = new KV(undefined, 'deletion');

    await kv.set(key, value);

    await kv.delete(key);

    const delItem = await kv.get(key);

    t.is(delItem, undefined);
});

test('clear namespace', async t => {
    const kv = new KV(undefined, 'clear');

    await Promise.all([
        kv.set('dada', 'dadadad'),
        kv.set('dddd', 'rgr'),
        kv.set('f6rtvgb', 'rftygvubhinjo'),
        kv.set('gy8tbinj', 'dar3fg'),
        kv.set('8iuybndaw', 'dadaqw'),
        kv.set('dawda', 'yg7bndwma'),
    ]);

    await kv.clear();

    const all = await kv.all();

    t.assert(all.length === 0);
});

test('returns all in namespace', async t => {
    const kv = new KV(undefined, 'many');
    const values = [
        kv.set('dada', 'dadadad'),
        kv.set('dddd', 'rgr'),
        kv.set('f6rtvgb', 'rftygvubhinjo'),
        kv.set('gy8tbinj', 'dar3fg'),
        kv.set('8iuybndaw', 'dadaqw'),
        kv.set('dawda', 'yg7bndwma'),
    ];

    await Promise.all(values);

    const all = await kv.all();

    t.assert(all.length === values.length);
});
    