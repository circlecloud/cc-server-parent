import { CcServerBoot, express } from './index'

import './function/http';
import './function/websocket';
import { DBClient } from '@cc-server/db';
import { MongoClient } from 'mongodb';
import { MongoCollection } from '@cc-server/db-mongo';

let boot = new CcServerBoot().static('public');
MongoClient.connect("mongodb://192.168.2.5:27017", { useNewUrlParser: true }, (error, client) => {
    if (error) {
        console.log(error)
    } else {
        boot.container.bind(DBClient).toConstantValue(new MongoCollection(client.db("faas").collection("users"))).whenTargetNamed("users")
        boot.build().listen();
    }
})
