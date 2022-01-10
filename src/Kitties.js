import React, { useEffect, useState } from 'react'
import { Form, Grid } from 'semantic-ui-react'

import { useSubstrate } from './substrate-lib'
import { TxButton } from './substrate-lib/components'

import KittyCards from './KittyCards'


// Construct a Kitty ID 
const convertToKittyHash = entry => {
  console.log('tohuman: ', parseInt(entry[0].toHuman()[0], 10));
  return parseInt(entry[0].toHuman()[0], 10);
};

// Kitty object
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

  // set Kitty ID
  const subscribeKittyCnt = () => {
    let unsub = null;

    const asyncFetch = async () => {
      // Query KittyCnt from runtime
      unsub = await api.query.substrateKitties.kittyCnt(async cnt => {
        const entries = await api.query.substrateKitties.kitties.entries();
        console.log('entries: ', entries);
        const hashes = entries.map(convertToKittyHash);
        setKittyHashes(hashes);
      });
    };

    asyncFetch();

    //cleanup 
    return () => {
      unsub && unsub();
    };
  };

  const subscribeKitties = () => {
    let unsub = null;

    const asyncFetch = async () => {
      // Get Kitty objects from storage
      unsub = await api.query.substrateKitties.kitties.multi(kittyHashes, kitties => {
        const kittyArr = kitties
          .map((kitty, ind) => constructKitty(kittyHashes[ind], kitty.value));
        setKitties(kittyArr);
      });
    };

    asyncFetch();

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
            callable: 'createKitty',
            inputParams: [],
            paramFields: []
          }}
        />
      </Form.Field>
    </Form>
    <div style={{ overflowWrap: 'break-word' }}>{status}</div>
  </Grid.Column>
}
