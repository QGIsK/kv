import {Schema, model, connect} from 'mongoose';
import {isObject, isStringEmpty} from './helpers/utils';

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
        return `${this.namespace}:${key}`;
    }

    async set(key: string, value: [String | Object]) {
        const name = this._createPrefix(key);

        const parsedValue = isObject(value) ? JSON.stringify(value) : value;

        return await KeyModel.findOneAndUpdate(
            {key: name},
            {key: name, value: parsedValue},
            {new: true, upsert: true, setDefaultsOnInsert: true},
        );
    }
}

export {KV};
