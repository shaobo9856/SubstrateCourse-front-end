import React, { useEffect, useState } from 'react'
import { Form, Grid } from 'semantic-ui-react'

import { useSubstrate } from './substrate-lib'
import { TxButton } from './substrate-lib/components'

import KittyCards from './KittyCards'


// Construct a Kitty ID from storage key
const convertToKittyHash = entry => {
  // return `0x${entry[0].toJSON().slice(-64)}`;
  console.log('tohuman: ', parseInt(entry[0].toHuman()[0], 10));
  return parseInt(entry[0].toHuman()[0], 10);
};

// Construct a Kitty object
const constructKitty = (hash, { dna, price, gender, owner }) => ({
  id: hash,
  dna,
  price: price.toJSON(),
  gender: gender.toJSON(),
  owner: owner.toJSON()
});



export default function Kitties (props) {
  const { api, keyring } = useSubstrate()
  const { accountPair } = props

  const [kittyHashes, setKittyHashes] = useState([]);
  const [kitties, setKitties] = useState([])
  const [status, setStatus] = useState('')

  // Subscription function for setting Kitty IDs
  const subscribeKittyCnt = () => {
    let unsub = null;

    const asyncFetch = async () => {
      // Query KittyCnt from runtime
      unsub = await api.query.substrateKitties.kittyCnt(async cnt => {
        // Fetch all kitty keys
        // Fetch all Kitty objects using entries()
        const entries = await api.query.substrateKitties.kitties.entries();
        // Retrieve only the Kitty ID and set to state
        // console.log('entries: ', entries);
        const hashes = entries.map(convertToKittyHash);
        setKittyHashes(hashes);
      });
    };

    asyncFetch();

    // return the unsubscription cleanup function
    return () => {
      unsub && unsub();
    };
  };

  // Subscription function to construct a Kitty object
  const subscribeKitties = () => {
    let unsub = null;

    const asyncFetch = async () => {
      // Get Kitty objects from storage
      unsub = await api.query.substrateKitties.kitties.multi(kittyHashes, kitties => {
        // Create an array of Kitty objects from `constructKitty`
        const kittyArr = kitties
          .map((kitty, ind) => constructKitty(kittyHashes[ind], kitty.value));
        // Set the array of Kitty objects to state
        setKitties(kittyArr);
      });
    };

    asyncFetch();

    // return the unsubscription cleanup function
    return () => {
      unsub && unsub();
    };
  };

  useEffect(subscribeKitties, [api, kittyHashes]);
  useEffect(subscribeKittyCnt, [api, keyring]);

  return <Grid.Column width={16}>
    <h1>小毛孩</h1>
    <KittyCards kitties={kitties} accountPair={accountPair} setStatus={setStatus}/>
    <Form style={{ margin: '1em 0' }}>
      <Form.Field style={{ textAlign: 'center' }}>
        <TxButton
          accountPair={accountPair} label='创建小毛孩' type='SIGNED-TX' setStatus={setStatus}
          attrs={{
            palletRpc: 'substrateKitties',
            callable: 'create',
            inputParams: [],
            paramFields: []
          }}
        />
      </Form.Field>
    </Form>
    <div style={{ overflowWrap: 'break-word' }}>{status}</div>
  </Grid.Column>
}
