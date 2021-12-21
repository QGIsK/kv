import mongoose from 'mongoose';
import {isObject, isStringEmpty} from './helpers/utils';

const {Schema, model, connect} = mongoose;

interface kv {
    key: string;
    value: string;
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
});

const KeyModel = model<kv>('KV', kvSchema);

class KV {
    uri: string;
    namespace: string;

    constructor(uri: string, namespace: string) {
        this.uri = isStringEmpty(uri) ? 'mongodb://localhost:27017/kv' : uri;
        this.namespace = isStringEmpty(namespace) ? 'kv' : namespace;

        connect(this.uri);
    }

    _createPrefix(key: string) {
        return `${this._clean(this.namespace)}:${this._clean(key)}`;
    }

    _clean(value: string) {
        return value.trim().split(' ').join('-');
    }

    set(key: string, value: [String | Object]) {
        const name = this._createPrefix(key);

        const parsedValue = isObject(value) ? JSON.stringify(value) : value;

        return KeyModel.findOneAndUpdate(
            {key: name},
            {key: name, value: parsedValue},
            {new: true, upsert: true, setDefaultsOnInsert: true},
        );
    }

    async get(key: string): Promise<string | object | null> {
        const name = this._createPrefix(key);
        const doc = await KeyModel.findOne({key: name});

        if (!doc) return doc;

        try {
            return JSON.parse(doc.value);
        } catch (_err) {
            return doc.value;
        }
    }

    async all() {
        const doc = await KeyModel.find({key: {$regex: this.namespace, $options: 'i'}}).select('key value');

        // Removes id
        return doc.map(doc => {
            return {key: doc.key, value: doc.value};
        });
    }

    delete(key: string) {
        const name = this._createPrefix(key);

        return KeyModel.deleteOne({key: name});
    }

    clear() {
        return KeyModel.deleteMany({key: {$regex: this.namespace, $options: 'i'}});
    }
}

export {KV};
