import mongoose from 'mongoose';
import EventEmitter from 'events';
import {isObject, isNumber, isStringEmpty, isDate} from './helpers/utils';

const {Schema, model, connect} = mongoose;

interface kv extends mongoose.Document {
    key: string;
    value: string;
    expiresAt: [Date | null];
}

const kvSchema = new Schema<kv>({
    key: {
        type: String,
        required: true,
    },
    value: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: false,
    },
});

const KeyModel = model<kv>('KV', kvSchema);

class KV extends EventEmitter {
    uri: string;
    namespace: string;

    constructor(uri: string, namespace: string) {
        super();

        this.uri = isStringEmpty(uri) ? 'mongodb://localhost:27017/kv' : uri;
        this.namespace = isStringEmpty(namespace) ? 'kv' : namespace;

        connect(this.uri).catch(err => this.emit('error', err));
    }

    _createPrefix(key: string): string {
        return `${this._clean(this.namespace)}:${this._clean(key)}`;
    }

    _clean(value: string): string {
        return value.trim().split(' ').join('-');
    }

    set(key: string, value: [String | Object], TTL: number): mongoose.Query<kv & {_id: any}, kv & {_id: any}, {}, kv> {
        const name = this._createPrefix(key);

        const parsedValue = isObject(value) ? JSON.stringify(value) : value;

        const ttl = isNumber(TTL) ? new Date(Date.now() + TTL) : null;

        return KeyModel.findOneAndUpdate(
            {key: name},
            {key: name, value: parsedValue, expiresAt: ttl},
            {new: true, upsert: true, setDefaultsOnInsert: true},
        );
    }

    async get(key: string): Promise<string | object | undefined> {
        if (isStringEmpty(key)) return undefined;
        const name = this._createPrefix(key);
        const doc = await KeyModel.findOne({key: name});

        if (!doc) return undefined;

        // @ts-ignore ignore expiresAt can be type null
        if (isDate(doc.expiresAt) && Date.now() > doc.expiresAt) {
            await this.delete(key);
            return undefined;
        }

        try {
            return JSON.parse(doc.value);
        } catch (_err) {
            return doc.value;
        }
    }

    async all(): Promise<{key: string; value: string}[]> {
        const doc = await KeyModel.find({key: {$regex: this.namespace, $options: 'i'}}).select('key value');

        // Removes id
        return doc.map(doc => {
            return {key: doc.key, value: doc.value};
        });
    }

    async delete(key: string): Promise<void> {
        if (isStringEmpty(key)) return;

        const name = this._createPrefix(key);

        await KeyModel.deleteOne({key: name});

        return;
    }

    async clear(): Promise<void> {
        await KeyModel.deleteMany({key: {$regex: this.namespace, $options: 'i'}});

        return;
    }
}

export {KV};
