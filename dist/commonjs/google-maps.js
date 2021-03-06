'use strict';

exports.__esModule = true;

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _defineDecoratedPropertyDescriptor(target, key, descriptors) { var _descriptor = descriptors[key]; if (!_descriptor) return; var descriptor = {}; for (var _key in _descriptor) descriptor[_key] = _descriptor[_key]; descriptor.value = descriptor.initializer ? descriptor.initializer.call(target) : undefined; Object.defineProperty(target, key, descriptor); }

var _aureliaDependencyInjection = require('aurelia-dependency-injection');

var _aureliaTemplating = require('aurelia-templating');

var _aureliaTaskQueue = require('aurelia-task-queue');

var _configure = require('./configure');

var GoogleMaps = (function () {
    var _instanceInitializers = {};

    _createDecoratedClass(GoogleMaps, [{
        key: 'address',
        decorators: [_aureliaTemplating.bindable],
        initializer: function initializer() {
            return null;
        },
        enumerable: true
    }, {
        key: 'longitude',
        decorators: [_aureliaTemplating.bindable],
        initializer: function initializer() {
            return 0;
        },
        enumerable: true
    }, {
        key: 'latitude',
        decorators: [_aureliaTemplating.bindable],
        initializer: function initializer() {
            return 0;
        },
        enumerable: true
    }, {
        key: 'zoom',
        decorators: [_aureliaTemplating.bindable],
        initializer: function initializer() {
            return 8;
        },
        enumerable: true
    }, {
        key: 'disableDefaultUI',
        decorators: [_aureliaTemplating.bindable],
        initializer: function initializer() {
            return false;
        },
        enumerable: true
    }], null, _instanceInitializers);

    function GoogleMaps(element, taskQueue, config) {
        _classCallCheck(this, _GoogleMaps);

        _defineDecoratedPropertyDescriptor(this, 'address', _instanceInitializers);

        _defineDecoratedPropertyDescriptor(this, 'longitude', _instanceInitializers);

        _defineDecoratedPropertyDescriptor(this, 'latitude', _instanceInitializers);

        _defineDecoratedPropertyDescriptor(this, 'zoom', _instanceInitializers);

        _defineDecoratedPropertyDescriptor(this, 'disableDefaultUI', _instanceInitializers);

        this.map = null;
        this._scriptPromise = null;

        this.element = element;
        this.taskQueue = taskQueue;
        this.config = config;

        if (!config.get('apiScript')) {
            console.error('No API script is defined.');
        }

        if (!config.get('apiKey')) {
            console.error('No API key has been specified.');
        }

        this.loadApiScript();
    }

    GoogleMaps.prototype.attached = function attached() {
        var _this = this;

        this.element.addEventListener('dragstart', function (evt) {
            evt.preventDefault();
        });

        this._scriptPromise.then(function () {
            var latLng = new google.maps.LatLng(parseFloat(_this.latitude), parseFloat(_this.longitude));

            var options = {
                center: latLng,
                zoom: parseInt(_this.zoom, 10),
                disableDefaultUI: _this.disableDefaultUI
            };

            _this.map = new google.maps.Map(_this.element, options);

            _this.map.addListener('click', function (e) {
                var changeEvent = undefined;
                if (window.CustomEvent) {
                    changeEvent = new CustomEvent('map-click', {
                        detail: e,
                        bubbles: true
                    });
                } else {
                    changeEvent = document.createEvent('CustomEvent');
                    changeEvent.initCustomEvent('map-click', true, true, { data: e });
                }

                _this.element.dispatchEvent(changeEvent);
            });

            _this.createMarker({
                map: _this.map,
                position: latLng
            });
        });
    };

    GoogleMaps.prototype.geocodeAddress = function geocodeAddress(address, geocoder) {
        var _this2 = this;

        this._scriptPromise.then(function () {
            geocoder.geocode({ 'address': address }, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    _this2.setCenter(results[0].geometry.location);

                    _this2.createMarker({
                        map: _this2.map,
                        position: results[0].geometry.location
                    });
                }
            });
        });
    };

    GoogleMaps.prototype.getCurrentPosition = function getCurrentPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                return Promise.resolve(position);
            }, function (evt) {
                return Promise.reject(evt);
            });
        } else {
            return Promise.reject('Browser Geolocation not supported or found.');
        }
    };

    GoogleMaps.prototype.loadApiScript = function loadApiScript() {
        var _this3 = this;

        if (this._scriptPromise) {
            return this._scriptPromise;
        }

        if (window.google === undefined || window.google.maps === undefined) {
            var _ret = (function () {
                var script = document.createElement('script');

                script.type = 'text/javascript';
                script.async = true;
                script.defer = true;
                script.src = _this3.config.get('apiScript') + '?key=' + _this3.config.get('apiKey') + '&callback=myGoogleMapsCallback';
                document.body.appendChild(script);

                _this3._scriptPromise = new Promise(function (resolve, reject) {
                    window.myGoogleMapsCallback = function () {
                        resolve();
                    };

                    script.onerror = function (error) {
                        reject(error);
                    };
                });

                return {
                    v: _this3._scriptPromise
                };
            })();

            if (typeof _ret === 'object') return _ret.v;
        }
    };

    GoogleMaps.prototype.setOptions = function setOptions(options) {
        if (!this.map) {
            return;
        }

        this.map.setOptions(options);
    };

    GoogleMaps.prototype.createMarker = function createMarker(options) {
        this._scriptPromise.then(function () {
            return Promise.resolve(new google.maps.Marker(options));
        });
    };

    GoogleMaps.prototype.getCenter = function getCenter() {
        var _this4 = this;

        this._scriptPromise.then(function () {
            return Promise.resolve(_this4.map.getCenter());
        });
    };

    GoogleMaps.prototype.setCenter = function setCenter(latLong) {
        var _this5 = this;

        this._scriptPromise.then(function () {
            _this5.map.setCenter(latLong);
        });
    };

    GoogleMaps.prototype.updateCenter = function updateCenter() {
        var _this6 = this;

        this._scriptPromise.then(function () {
            var latLng = new google.maps.LatLng(parseFloat(_this6.latitude), parseFloat(_this6.longitude));
            _this6.setCenter(latLng);
        });
    };

    GoogleMaps.prototype.addressChanged = function addressChanged(newValue) {
        var _this7 = this;

        this._scriptPromise.then(function () {
            var geocoder = new google.maps.Geocoder();

            _this7.taskQueue.queueMicroTask(function () {
                _this7.geocodeAddress(newValue, geocoder);
            });
        });
    };

    GoogleMaps.prototype.latitudeChanged = function latitudeChanged(newValue) {
        var _this8 = this;

        this._scriptPromise.then(function () {
            _this8.taskQueue.queueMicroTask(function () {
                _this8.updateCenter();
            });
        });
    };

    GoogleMaps.prototype.longitudeChanged = function longitudeChanged(newValue) {
        var _this9 = this;

        this._scriptPromise.then(function () {
            _this9.taskQueue.queueMicroTask(function () {
                _this9.updateCenter();
            });
        });
    };

    GoogleMaps.prototype.zoomChanged = function zoomChanged(newValue) {
        var _this10 = this;

        this._scriptPromise.then(function () {
            _this10.taskQueue.queueMicroTask(function () {
                var zoomValue = parseInt(newValue, 10);
                _this10.map.setZoom(zoomValue);
            });
        });
    };

    GoogleMaps.prototype.error = function error() {
        console.log.apply(console, arguments);
    };

    var _GoogleMaps = GoogleMaps;
    GoogleMaps = _aureliaDependencyInjection.inject(Element, _aureliaTaskQueue.TaskQueue, _configure.Configure)(GoogleMaps) || GoogleMaps;
    GoogleMaps = _aureliaTemplating.customElement('google-map')(GoogleMaps) || GoogleMaps;
    return GoogleMaps;
})();

exports.GoogleMaps = GoogleMaps;