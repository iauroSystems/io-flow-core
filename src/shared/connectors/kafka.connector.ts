import { Kafka, logLevel } from 'kafkajs';
import { Operations } from 'src/common/const/constants';
import { KafkaConnectorDto } from '../dtos/connectors.dto';

export class KafkaConnector {
    // kafka: Kafka;
    constructor () {

    }

    async call(kafkaConnectorConfig: KafkaConnectorDto) {
        switch (kafkaConnectorConfig?.operation) {
            case 'produce': {
                try {
                    const kafka = new Kafka({
                        clientId: kafkaConnectorConfig.clientId,
                        brokers: [kafkaConnectorConfig.broker], // Specify the Kafka brokers here
                        logLevel: logLevel.ERROR, // Set the desired log level
                    });
                    const { topic, data } = kafkaConnectorConfig;
                    const producer = kafka.producer();
                    await producer.connect();
                    await producer.send({
                        topic,
                        messages: [
                            {
                                value: JSON.stringify(data),
                            },
                        ],
                    });
                    await producer.disconnect();
                    return [null, 'Message sent to Kafka successfully'];
                } catch (error) {
                    return [error];
                }
            }
            case 'comsume': {
                // consumer code
            }
        }

    }
}