// @ts-nocheck

import test from 'ava';

import {isString, isArray, isStringEmpty, isDate, isObject, isNumber, doesInclude} from '../dist/helpers/utils.js';

test('is string', t => {
    t.true(isString(''));
    t.true(isString('wassaa'));

    t.true(!isString(null));
    t.true(!isString(undefined));
    t.true(!isString([]));
    t.true(!isString({}));
});

test('is array', t => {
    t.true(!isArray({}));
    t.true(isArray([]));
});

test('is string empty', t => {
    t.true(isStringEmpty(''));
    t.true(isStringEmpty(' '));
    t.true(isStringEmpty({}));
    t.true(isStringEmpty([]));

    t.true(!isStringEmpty('wassaa'));
});

test('is date', t => {
    t.true(isDate(new Date()));
    t.true(!isDate('hello'));
});

test('is object', t => {
    t.true(isObject({}));

    t.true(!isObject(''));
    t.true(!isObject('wassup'));

    t.true(!isObject([]));
    t.true(!isObject(new Date()));
});

test('is number', t => {
    t.true(isNumber(69));
    t.true(isNumber('420'));

    t.true(!isNumber({}));
    t.true(!isNumber([]));
});

test('does include', t => {
    t.true(doesInclude(32, '32'));
    t.true(doesInclude('warrior', 'wa'));

    t.true(!doesInclude('uwu', 'owo'));
    t.true(doesInclude({obj: 'hi'}, {obj: 'hi'}));
});
