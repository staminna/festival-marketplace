import React, { Component } from 'react';
import Web3 from 'web3';
import festivalFactory from '../proxies/FestivalFactory';
import FestivalNFT from '../proxies/FestivalNFT';
import FestivalMarketplace from '../proxies/FestivalMarketplace';
import festToken from '../proxies/FestToken';
import renderNotification from '../utils/notification-handler';

let web3;

class Purchase extends Component {
  constructor() {
    super();

    this.state = {
      festivals: [],
    };

    web3 = new Web3(window.ethereum);
  }

  async componentDidMount() {
    await this.updateFestivals();
  }

  updateFestivals = async () => {
    try {
      const initiator = await web3.eth.getCoinbase();
      const activeFests = await festivalFactory.methods.getActiveFests().call({ from: initiator });
      const fests = await Promise.all(activeFests.map(async fest => {
        const festDetails = await festivalFactory.methods.getFestDetails(fest).call({ from: initiator });
        const [festName, festSymbol, ticketPrice, totalSupply, marketplace] = Object.values(festDetails);
        const nftInstance = await FestivalNFT(fest);
        const saleId = await nftInstance.methods.getNextSaleTicketId().call({ from: initiator });

        return (
          <tr key={fest}>
            <td className="center">{festName}</td>
            <td className="center">{web3.utils.fromWei(ticketPrice, 'ether')}</td>
            <td className="center">{totalSupply - saleId}</td>

            <td className="center"><button type="submit" className="custom-btn login-btn" onClick={this.onPurchaseTicket.bind(this, marketplace, ticketPrice, initiator)}>Buy</button></td>
          </tr>
        );
      }));

      this.setState({ festivals: fests });
    } catch (err) {
      renderNotification('danger', 'Error', err.message);
      console.log('Error while updating the fetivals', err);
    }
  }

  onPurchaseTicket = async (marketplace, ticketPrice, initiator) => {
    try {
      const marketplaceInstance = await FestivalMarketplace(marketplace);
      await festToken.methods.approve(marketplace, ticketPrice).send({ from: initiator, gas: 6700000 });
      await marketplaceInstance.methods.purchaseTicket().send({ from: initiator, gas: 6700000 });
      await this.updateFestivals();

      renderNotification('success', 'Success', `Ticket for the Festival purchased successfully!`);
    } catch (err) {
      console.log('Error while creating new festival', err);
      renderNotification('danger', 'Error', err.message);
    }
  }

  inputChangedHandler = (e) => {
    const state = this.state;
    state[e.target.name] = e.target.value;
    this.setState(state);
  }

  render() {
    return (
      <div className="container " className="col s12 m6 offset-m3 l4 offset-l4 z-depth-6 card-panel">
        <h4 className="center">Purchase Tickets</h4>
        <table id='requests' className="responsive-table striped" >
          <thead>
            <tr>
              <th key='name' className="center">Name</th>
              <th key='price' className="center">Price(in FEST)</th>
              <th key='left' className="center">Tickets Left</th>
              <th key='purchase' className="center">Purchase</th>
            </tr>
          </thead>
          <tbody className="striped highlight">
            {this.state.festivals}
          </tbody>
        </table>
      </div >
    )
  }
}

export default Purchase;  