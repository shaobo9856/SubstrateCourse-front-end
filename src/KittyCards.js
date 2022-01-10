import React from 'react'
import { Button, Card, Grid, Message, Modal, Form, Label } from 'semantic-ui-react'

import KittyAvatar from './KittyAvatar'
import { TxButton } from './substrate-lib/components'

// --- About Modal ---

const TransferModal = props => {
  const { kitty, accountPair, setStatus } = props
  const [open, setOpen] = React.useState(false)
  const [formValue, setFormValue] = React.useState({})

  const formChange = key => (ev, el) => {
    setFormValue({ ...formValue, [key]: el.value })
  }

  const confirmAndClose = (unsub) => {
    unsub()
    setOpen(false)
  }

  return <Modal onClose={() => setOpen(false)} onOpen={() => setOpen(true)} open={open}
    trigger={<Button basic color='blue'>转让</Button>}>
    <Modal.Header>毛孩转让</Modal.Header>
    <Modal.Content><Form>
      <Form.Input fluid label='毛孩 ID' readOnly value={kitty.id}/>
      <Form.Input fluid label='转让对象' placeholder='对方地址' onChange={formChange('target')}/>
    </Form></Modal.Content>
    <Modal.Actions>
      <Button basic color='grey' onClick={() => setOpen(false)}>取消</Button>
      <TxButton
        accountPair={accountPair} label='确认转让' type='SIGNED-TX' setStatus={setStatus}
        onClick={confirmAndClose}
        attrs={{
          palletRpc: 'substrateKitties',
          callable: 'transfer',
          inputParams: [formValue.target, kitty.id],
          paramFields: [true, true]
        }}
      />
    </Modal.Actions>
  </Modal>
}

// --- Set Price ---
const SetPrice = props => {
  const { kitty, accountPair, setStatus } = props
  const [open, setOpen] = React.useState(false)
  const [formValue, setFormValue] = React.useState({})

  const formChange = key => (ev, el) => {
    setFormValue({ ...formValue, [key]: el.value })
  }

  const confirmAndClose = (unsub) => {
    setOpen(false);
    if (unsub && typeof unsub === 'function') unsub();
  }

  return <Modal onClose={() => setOpen(false)} onOpen={() => setOpen(true)} open={open}
    trigger={<Button basic color='blue'>设置价格</Button>}>
    <Modal.Header>设置毛孩价格</Modal.Header>
    <Modal.Content><Form>
      <Form.Input fluid label='毛孩 ID' readOnly value={kitty.id}/>
      <Form.Input fluid label='Price' placeholder='输入价格' onChange={formChange('target')}/>
    </Form></Modal.Content>
    <Modal.Actions>
      <Button basic color='grey' onClick={() => setOpen(false)}>取消</Button>
      <TxButton
        accountPair={accountPair} label='设置价格' type='SIGNED-TX' setStatus={setStatus}
        onClick={confirmAndClose}
        attrs={{
          palletRpc: 'substrateKitties',
          callable: 'setPrice',
          inputParams: [kitty.id, formValue.target],
          paramFields: [true, true]
        }}
      />
    </Modal.Actions>
  </Modal>
}


// --- About Kitty Card ---

const KittyCard = props => {
  const { kitty, accountPair, setStatus } = props
  const { id = null, dna = null, owner = null, gender = null, price = null } = kitty
  const displayDna = dna && dna.join(', ')
  const isSelf = accountPair.address === kitty.owner

  return <Card>
    { isSelf && <Label as='a' floating color='teal'>我的</Label> }
    <KittyAvatar dna={dna} />
    <Card.Content>
      <Card.Header>ID 号: {id}</Card.Header>
      <Card.Meta style={{ overflowWrap: 'break-word' }}>
        DNA: {displayDna}
      </Card.Meta>
      <Card.Description>
        <p style={{ overflowWrap: 'break-word' }}>
          Owner:<br/>
          {owner}
        </p>
        <p style={{ overflowWrap: 'break-word' }}>
          Gender:<br/>
          {gender}
        </p>
        <p style={{ overflowWrap: 'break-word' }}>
          Price:<br/>
          {price}
        </p>
      </Card.Description>
    </Card.Content>
    <Card.Content extra style={{ textAlign: 'center' }}>{ owner === accountPair.address
      ? <>
          <SetPrice kitty={kitty} accountPair={accountPair} setStatus={setStatus}/>
          <TransferModal kitty={kitty} accountPair={accountPair} setStatus={setStatus}/>
        </>
      : ''
    }</Card.Content>
  </Card>
}

const KittyCards = props => {
  const { kitties, accountPair, setStatus } = props

  if (kitties.length === 0) {
    return <Message info>
      <Message.Header>现在连一只毛孩都木有，赶快创建一只&nbsp;
        <span role='img' aria-label='point-down'>👇</span>
      </Message.Header>
    </Message>
  }

  return <Grid columns={3}>{kitties.map((kitty, i) =>
    <Grid.Column key={`kitty-${i}`}>
      <KittyCard kitty={kitty} accountPair={accountPair} setStatus={setStatus}/>
    </Grid.Column>
  )}</Grid>
}

export default KittyCards
