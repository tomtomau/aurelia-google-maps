'use strict';

exports.__esModule = true;
exports.configure = configure;

var _configure = require('./configure');

function configure(aurelia, configCallback) {
    var instance = aurelia.container.get(_configure.Configure);

    if (configCallback !== undefined && typeof configCallback === 'function') {
        configCallback(instance);
    }

    aurelia.globalResources('./google-maps');
}