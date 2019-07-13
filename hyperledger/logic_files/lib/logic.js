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
/* global getAssetRegistry getFactory emit */
/**
 * Sample transaction processor function.
 * @param {catchit.addNewUser} tx The sample transaction instance.
 * @transaction
 */
async function addNewUser(tx)
{  // eslint-disable-line no-unused-vars
    // new participant to be added.
    const newUser = tx.newParticipant;
    // Update the asset with the new value.
    tx.chit.customers.push(newUser);
    tx.newParticipant.networkId = tx.chit.networkId;
    tx.chit.currentParticipants = tx.chit.currentParticipants + 1;
    // Get the asset registry for the asset.
    const assetRegistry = await getAssetRegistry('catchit.chitRecord');
    // Update the asset in the asset registry.
    await assetRegistry.update(tx.chit);
    // Emit an event for the modified asset.
    /*let event = getFactory().newEvent('catchit.chitRecord', 'SampleEvent');
    event.asset = tx.asset;
    event.oldValue = oldValue;
    event.newValue = tx.newValue;
    emit(event);*/
}
/**
 * Sample transaction processor function.
 * @param {catchit.ackMonthlyPay} tx The sample transaction instance.
 * @transaction
 */
async function ackMonthlyPay(tx)
{  // eslint-disable-line no-unused-vars
    const User = tx.customer;
    if (tx.chit.customers.indexOf(User) >= 0 && tx.chit.paidCustomers.indexOf(User) == -1)
    {
        tx.chit.paidCustomers.push(User);
        tx.chit.countMonPaid = tx.chit.countMonPaid + 1;
        tx.customer.bonusPoints = tx.customer.bonusPoints + 10;
        tx.customer.hasPaid = true;
    }
  	tx.chit.statusOfBid = 1;
    const assetRegistry = await getAssetRegistry('catchit.chitRecord.chitRecord');
    await assetRegistry.update(tx.chit);
    const assetRegistry1 = await getParticipantRegistry('catchit.chitRecord.chitParticipant');
    await assetRegistry1.update(tx.customer);
}
/**
 * Sample transaction processor function.
 * @param {catchit.refForBonus} tx The sample transaction instance.
 * @transaction
 */
async function refForBonus(tx)
{  // eslint-disable-line no-unused-vars
    // giver.
    const giver = tx.giver;
    //taker
    const taker = tx.taker;
    if (giver.bonusPoints >= 100 && tx.taker.referrer == null)
    {
        tx.taker.bonusPoints = tx.taker.bonusPoints + tx.points;
        tx.taker.referrer = tx.giver;
    }
    // Get the asset registry for the asset.
    const assetRegistry = await getParticipantRegistry('catchit.chitRecord.chitParticipant');
    // Update the asset in the asset registry.
    await assetRegistry.update(tx.taker);
}
/**
 * Sample transaction processor function.
 * @param {catchit.chitBid} tx The sample transaction instance.
 * @transaction
 */
async function chitBid(tx)
{  // eslint-disable-line no-unused-vars
  	var found=0;
  	for(var i=0;i<tx.chit.bids.length;i++)
    if (tx.chit.bids[i].customerId==tx.biddingCustomer.aadhaarId)
    {
        tx.chit.bids[i].amount=tx.bidAmount;
        const assetRegistry = await getAssetRegistry('catchit.chitRecord');
        await assetRegistry.update(tx.chit);
      	found=1;
    }
  	if(found==0)
    {
      tx.temp.amount=tx.bidAmount;
      tx.temp.customerId=tx.biddingCustomer.aadhaarId;
      tx.chit.bids.push(tx.temp);
      const assetRegistry = await getAssetRegistry('catchit.chitRecord');
      await assetRegistry.update(tx.chit);
    }
  	tx.chit.statusOfBid = 2;
    let customerRegistry = await getParticipantRegistry('catchit.chitParticipant');
    await customerRegistry.update(tx.biddingCustomer);
    // Emit an event for the modified asset.
    /*let event = getFactory().newEvent('catchit', 'SampleEvent');
    event.asset = tx.asset;
    event.oldValue = oldValue;
    event.newValue = tx.newValue;
    emit(event);*/
}

/**
 * Sample transaction processor function.
 * @param {catchit.finalMonthBid} tx The sample transaction instance.
 * @transaction
 */
async function finalMonthBid(tx)
{  
  tx.temp.amount = tx.chit.ratePerMonth;
  for(var i=0;i<tx.chit.bids.length;i++){
  	if(tx.temp.amount > tx.chit.bids[i].amount)
    {
      tx.temp.amount = tx.chit.bids[i].amount;
      tx.chit.currentMonthWinner = tx.chit.bids[i].customer;
    }
  }
  tx.chit.ratePerMonth = tx.temp.amount;
  const assetRegistry = await getAssetRegistry('catchit.chitRecord');
  await assetRegistry.update(tx.chit);
}