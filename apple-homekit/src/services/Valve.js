/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    /*
    Service.Valve = function(displayName, subtype) {
    Service.call(this, displayName, '000000D0-0000-1000-8000-0026BB765291', subtype);

    // Required Characteristics
    this.addCharacteristic(Characteristic.Active);
    this.addCharacteristic(Characteristic.InUse);
    this.addCharacteristic(Characteristic.ValveType);

    // The value property of ValveType must be one of the following:
    Characteristic.ValveType.GENERIC_VALVE = 0;
    Characteristic.ValveType.IRRIGATION = 1;
    Characteristic.ValveType.SHOWER_HEAD = 2;
    Characteristic.ValveType.WATER_FAUCET = 3;

    // Optional Characteristics
    this.addOptionalCharacteristic(Characteristic.SetDuration);
    this.addOptionalCharacteristic(Characteristic.RemainingDuration);
    this.addOptionalCharacteristic(Characteristic.IsConfigured);
    this.addOptionalCharacteristic(Characteristic.ServiceLabelIndex);
    this.addOptionalCharacteristic(Characteristic.StatusFault);
    this.addOptionalCharacteristic(Characteristic.Name);
     */

    return function createService_Valve(acc, settings, subtype) {
        /* istanbul ignore if */
        if (typeof settings.payload.activeTrue === 'undefined') {
            settings.payload.activeTrue = true;
        }

        /* istanbul ignore if */
        if (typeof settings.payload.inUseTrue === 'undefined') {
            settings.payload.inUseTrue = true;
        }

        /* istanbul ignore if */
        if (typeof settings.payload.faultTrue === 'undefined') {
            settings.payload.faultTrue = true;
        }

        /* istanbul ignore if */
        if (typeof settings.payload.activeFalse === 'undefined') {
            settings.payload.activeFalse = false;
        }

        acc.addService(Service.Valve, settings.name, subtype);

        const type = settings.config.ValveType || 0;

        log.debug('> hap set', settings.name, 'ValveType', type);
        acc.getService(subtype)
            .setCharacteristic(Characteristic.ValveType, type);

        mqttSub(settings.topic.statusInUse, settings.json.statusInUse, val => {
            const inUse = val === settings.payload.inUseTrue ? 1 : 0;
            log.debug('> hap update', settings.name, 'InUse', inUse);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.InUse, inUse);
        });
        acc.getService(subtype)
            .getCharacteristic(Characteristic.InUse)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'InUse');
                const inUse = mqttStatus(settings.topic.statusInUse, settings.json.statusInUse) === settings.payload.inUseTrue ? 1 : 0;
                log.debug('> hap re_get', settings.name, 'InUse', inUse);
                callback(null, inUse);
            });

        const obj = {acc, settings, subtype};

        require('../characteristics')('SetDuration', obj, iface);
        require('../characteristics')('RemainingDuration', obj, iface);
        require('../characteristics/Active')({acc, settings, subtype}, iface);
        require('../characteristics/StatusFault')({acc, settings, subtype}, iface);
    };
};
