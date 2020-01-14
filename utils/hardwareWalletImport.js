import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import AppBtc from '@ledgerhq/hw-app-btc';
import AppEth from '@ledgerhq/hw-app-eth';
import eip55 from 'eip55';
import TrezorConnect from 'trezor-connect';

const getLedgerWebUSBTranport = async () => {
  try {
    const transport = await TransportWebUSB.create();
    transport.setDebugMode(true);
    return transport;
  } catch (error) {
    console.log(`Failed: ${error.message}`, error);
    return null;
  }
};

export const fetchLedgerETHAddress = async (verify) => {
  const transport = await getLedgerWebUSBTranport();
  try {
    const eth = new AppEth(transport);
    const path = "44'/60'/0'/0/0"; // HD derivation path
    const r = await eth.getAddress(path, verify);
    const ethAddress = eip55.encode(r.address);
    console.log('#### fetchLedgerETHAddress  : ', ethAddress);
    // if (this.unmounted) return;
    return ethAddress;
  } catch (error) {
    // in this case, user is likely not on Ethereum app
    console.log(`Failed: ${error.message}`, error);
    // if (this.unmounted) return;
    throw error;
  }
};

export const fetchLedgerBTCAddress = async () => {
  const transport = await getLedgerWebUSBTranport();
  try {
    const appBtc = new AppBtc(transport);
    const { bitcoinAddress } = await appBtc.getWalletPublicKey("49'/0'/0'/0/0", {
      format: 'p2sh',
    });
    console.log('#### bitcoinAddress', bitcoinAddress);
    return bitcoinAddress;
  } catch (error) {
    console.log('Error occured', error);
    throw error;
  }
};

export default {
  fetchLedgerETHAddress,
  fetchLedgerBTCAddress,
};
