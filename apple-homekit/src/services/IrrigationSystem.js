/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_IrrigationSystem(acc, settings, subtype) {
        /* istanbul ignore else */
        if (typeof settings.payload.activeTrue === 'undefined') {
            settings.payload.activeTrue = true;
        }

        /* istanbul ignore if */
        if (typeof settings.payload.inUseTrue === 'undefined') {
            settings.payload.inUseTrue = true;
        }

        /* istanbul ignore else */
        if (typeof settings.payload.faultTrue === 'undefined') {
            settings.payload.faultTrue = true;
        }

        /* istanbul ignore else */
        if (typeof settings.payload.activeFalse === 'undefined') {
            settings.payload.activeFalse = false;
        }

        acc.addService(Service.IrrigationSystem, settings.name, subtype);

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

        require('../characteristics')('ProgramMode', obj, iface);
        require('../characteristics')('RemainingDuration', obj, iface);

        require('../characteristics/Active')(obj, iface);
        require('../characteristics/StatusFault')(obj, iface);
    };
};
