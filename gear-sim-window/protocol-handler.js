const electron = require('electron')
const ActionFactory = require('./actions/action-factory');

module.exports = class GearSimProtocolHandler {
    constructor() {
        this.actionFactory = new ActionFactory();
    }

    handle(req, callback) {
        try {
            const action = this.actionFactory.create(req.url);
            Promise.resolve(action.process()).then(result => {
                const stringified = JSON.stringify(result);
                callback({ mimeType: 'application/json', data: stringified });
            }).catch(err => {
                console.error(err);
                callback({ mimeType: 'application/json', data: JSON.stringify({ error: err.message }) });
            });
        } catch(err) {
            console.error(err);
            callback({ mimeType: 'application/json', data: JSON.stringify({ error: err.message }) });
        }
    }
}
