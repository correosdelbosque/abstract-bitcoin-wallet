import Mnemonic from 'bitcore-mnemonic'

class AddrInfo {
  constructor(opts) {
    this.address = opts.address || 'someaddress'
    this.balance = opts.balance || 0
    this.sent = opts.sent || 0
    this.received = opts.received || 0
  }
}

class MockWallet {
  constructor(config) {
    this.config = config
    this.network = config.network || 'testnet'
    this.code = new Mnemonic(config.mnemonic)
    this.xpriv = this.code.toHDPrivateKey()
    this.hdIndex = 0

    this._summary = {
      balance: 0,
      confirmedBalance: 0,
    }
    this._addresses = {}
  }

  summary() {
    return Promise.resolve(this._summary)
  }

  _getAddrInfo(address) {
    if (this._addresses[address]) {
      return this._addresses[address]
    }
    const addrInfo = new AddrInfo({ address })
    this._addresses[address] = addrInfo
    return addrInfo
  }

  send({ address, amount }) {
    return Promise.resolve()
    .then(() => {
      setTimeout(() => {
        // wait 500 ms before updating address info
        // to simulate slow wallet backend
        const addrInfo = this._getAddrInfo(address)
        addrInfo.balance += amount
        addrInfo.received += amount
      }, 500)
      return {
        hash: 'sometxhash',
      }
    })
  }

  createAddress() {
    return Promise.resolve()
      .then(() => {
        const { privateKey } = this.xpriv.derive(`m/${this.hdIndex}`)
        this.hdIndex++
        const address = privateKey.toAddress(this.network).toString()
        const addrInfo = this._getAddrInfo(address)
        return addrInfo
      })
  }

  address({ address }) {
    return Promise.resolve()
    .then(() => this._getAddrInfo(address))
  }

  transaction({ hash }) {
    return Promise.resolve({
      hash,
      outputs: [],
      inputs: [],
      fee: 100,
      hex: 'deadbeef',
    })
  }
}

export default (config) => new MockWallet(config)
