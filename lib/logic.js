/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
/**
 * Write your transction processor functions here
 */

/**
 * This transaction is triggered when the drone passes the middler detectors.
 * @param {org.drone.mynetwork.PassingMiddlerTransaction} tx
 * @transaction
 */
async function PassingMiddlerTransaction(tx) {
    // Save the old value of the asset.
    const record = tx.middlerPassingRecord;
    let sender=record.sender;
    let middler=record.middler;
    let receiver=record.receiver;
    let contract=record.contract;

    // Update the asset with the new value.
    sender.accountBalance -= contract.chargeForSenderForPassing;
    receiver.accountBalance -= contract.chargeForReceiverForPassing;
    middler.accountBalance += (contract.chargeForSenderForPassing + contract.chargeForReceiverForPassing);


    // Get the asset registry for the asset. And update the asset in the asset registry.

    const senderRegistry = await getParticipantRegistry('org.drone.mynetwork.Sender');   
    await senderRegistry.update(sender);

    const middlerRegistry = await getParticipantRegistry('org.drone.mynetwork.Middler');   
    await middlerRegistry.update(middler);

    const receiverRegistry = await getParticipantRegistry('org.drone.mynetwork.Receiver');   
    await receiverRegistry.update(receiver);

    const middlerPassingRecordRegistry = await getAssetRegistry('org.drone.mynetwork.MiddlerPassingRecord');   
    await middlerPassingRecordRegistry.update(record);
}

/**
 * This transaction is triggered when the drone arrived the receiver detector.
 * @param {org.drone.mynetwork.ShipmentArrivedTransaction} tx
 * @transaction
 */

 async function ShipmentArrivedTransaction(tx){
    // Save the old value of the asset.
    const record = tx.shipmentRecord;
    let sender=record.sender;
    let receiver=record.receiver;
    let contract=record.contract;

    // Update the asset with the new value.
    sender.accountBalance += contract.shipmentHandleFee;
    receiver.accountBalance -= contract.shipmentHandleFee;

    // Get the asset registry for the asset. And update the asset in the asset registry.

    const senderRegistry = await getParticipantRegistry('org.drone.mynetwork.Sender');   
    await senderRegistry.update(sender);

    const receiverRegistry = await getParticipantRegistry('org.drone.mynetwork.Receiver');   
    await receiverRegistry.update(receiver);

    const ShipmentRecordRegistry = await getAssetRegistry('org.drone.mynetwork.ShipmentRecord');   
    await ShipmentRecordRegistry.update(record);
 }

 /**
 * This transaction simulates the behavior of Detecting APP.
 * @param {org.drone.mynetwork.SimulateAppBehavior} tx
 * @transaction
 */

async function SimulateAppBehavior(tx) {

    let factory = getFactory();
    let NS = 'org.drone.mynetwork';

    // create the Sender
    let sender = factory.newResource(NS, 'Sender', 'sender1@email.com');
    let senderAddress = factory.newConcept(NS, 'Address');
    senderAddress.latitude = '40.6840';
    senderAddress.latitudeDir = 'N';
    senderAddress.longitude = '74.0062';
    senderAddress.longitudeDir = 'W';

    sender.address = senderAddress;
    sender.accountBalance = 1000;

    // create the Middler
    let middler = factory.newResource(NS, 'Middler', 'middler1@email.com');
    let middlerAddress = factory.newConcept(NS, 'Address');
    middlerAddress.latitude = '30.3000';
    middlerAddress.latitudeDir = 'S';
    middlerAddress.longitude = '40.4000';
    middlerAddress.longitudeDir = 'E';

    middler.address = middlerAddress;
    middler.accountBalance = 1000;

    // create the Receiver
    let receiver = factory.newResource(NS, 'Receiver', 'receiver1@email.com');
    let receiverAddress = factory.newConcept(NS, 'Address');
    receiverAddress.latitude = '30.3000';
    receiverAddress.latitudeDir = 'S';
    receiverAddress.longitude = '40.4000';
    receiverAddress.longitudeDir = 'E';

    receiver.address = receiverAddress;
    receiver.accountBalance = 1000;

    // create the contract
    let contract = factory.newResource(NS, 'Contract', 'CON_001');
    contract.chargeForSenderForPassing=10.00;
    contract.chargeForReceiverForPassing=10.00;
    contract.shipmentHandleFee=500.00;
    

    // create the shipment record
    let shipmentRecord = factory.newResource(NS, 'ShipmentRecord', 'SHIP_001');
    shipmentRecord.sender = factory.newRelationship(NS, 'Sender', 'sender1@email.com');
    shipmentRecord.receiver = factory.newRelationship(NS, 'Receiver', 'receiver1@email.com');
    let yesterday = tx.timestamp;
    yesterday.setDate(yesterday.getDate() - 1);
    shipmentRecord.arrivalDateTime = yesterday; // the shipment has to arrive tomorrow
    shipmentRecord.contract = factory.newRelationship(NS, 'Contract', 'CON_001');

    // create the middle passing record
    let middlerPassingRecord = factory.newResource(NS, 'MiddlerPassingRecord', 'MIDPASS_001');
    middlerPassingRecord.sender = factory.newRelationship(NS, 'Sender', 'sender1@email.com');
    middlerPassingRecord.middler = factory.newRelationship(NS, 'Middler', 'middler1@email.com');
    middlerPassingRecord.receiver = factory.newRelationship(NS, 'Receiver', 'receiver1@email.com');
    let today = tx.timestamp;
    middlerPassingRecord.passingDateTime = today; // the shipment has to arrive tomorrow
    middlerPassingRecord.contract = factory.newRelationship(NS, 'Contract', 'CON_001');
    
    const senderRegistry= await getParticipantRegistry(NS + '.Sender');
    senderRegistry.addAll([sender]);

    const middlerRegistry= await getParticipantRegistry(NS + '.Middler');
    middlerRegistry.addAll([middler]);

    const receiverRegistry= await getParticipantRegistry(NS + '.Receiver');
    receiverRegistry.addAll([receiver]);

    const contractRegistry= await getAssetRegistry(NS + '.Contract');
    contractRegistry.addAll([contract]);

    const middlerPassingRecordRegistry= await getAssetRegistry(NS + '.MiddlerPassingRecord');
    middlerPassingRecordRegistry.addAll([middlerPassingRecord]);

    const ShipmentRecordRegistry= await getAssetRegistry(NS + '.ShipmentRecord');
    ShipmentRecordRegistry.addAll([shipmentRecord]);
}