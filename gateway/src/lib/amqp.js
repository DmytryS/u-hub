import amqp from 'amqplib';

import logger from './logger'
console.log(`Rabbit URI: ${process.env.AMQP_URI}`);

const connection = amqp.connect(process.env.AMQP_URI).catch(logger.error);


process.once('SIGINT', () => connection.close());

// function fib(n) {
//     // Do it the ridiculous, but not most ridiculous, way. For better,
//     // see http://nayuki.eigenstate.org/page/fast-fibonacci-algorithms
//     var a = 0, b = 1;
//     for (var i = 0; i < n; i++) {
//         var c = a + b;
//         a = b; b = c;
//     }
//     return a;
// }

export const listen = (queue) => {
    console.log(1111, connection);

    return conn.createChannel().then(function (ch) {
        let ok = ch.assertQueue(process.env.AMQP_GATEWAY_QUEUE, { durable: false });
        ok = ok.then(function () {
            ch.prefetch(1);
            return ch.consume(process.env.AMQP_GATEWAY_QUEUE, reply);
        });
        return ok.then(function () {
            console.log(' [x] Awaiting RPC requests');
        });

        function reply(msg) {
            var n = parseInt(msg.content.toString());
            console.log(' [.] fib(%d)', n);
            var response = fib(n);
            ch.sendToQueue(msg.properties.replyTo,
                Buffer.from(response.toString()),
                { correlationId: msg.properties.correlationId });
            ch.ack(msg);
        }
    });
}
