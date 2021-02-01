// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.5.0;

/// @title Voting with delegation.
contract CarbonCredit {

   // This declares a new type which represents
   // participants of an emmission market.


    uint public exchange_rate;
    uint public emmision_limit;

    struct Participant {
        uint carbon_credits;
        uint emmisions;
        uint balance;
        string name;
    }

    struct Sell_order {
        uint sell_price;
        uint volume;
        address seller;
    }

    struct Buy_order {
        uint volume;
        address buyer;
        uint forced;
    }

  //The admin is responsible for issuing Carbon Credits, Rewarding low
  // emmisions, Punishing high emmisions and Managing the exchange.

  address public admin;



   // This declares a state variable that
   // stores a `participant` struct for each possible address.
    mapping(address => Participant) public participants;
    mapping(string => address) private Names;

    // A dynamically-sized array of 'buy' and 'sell' limit orders.
    //Sell_order[] public exchange_sell;
    //Buy_order[] public exchange_buy;
    mapping(uint => Sell_order) public exchange_sell;
    mapping(uint => Buy_order) public exchange_buy;

    uint public num_buy_orders = 0;
    uint public num_sell_orders = 0;

    constructor() public {
        admin = msg.sender;
        exchange_rate = 100;
        emmision_limit = 5;
    }

    // To be called to initialize a participant and assign emmisions and balance

    function initialize_participants(address participant_address, uint balance, string memory name) public {
        require(
            msg.sender == admin,
            "Only admin can add."
        );
        participants[participant_address].emmisions = 0;
        participants[participant_address].balance = balance;
        participants[participant_address].carbon_credits = 500;
        participants[participant_address].name = name;
        Names[name] = participant_address;
    }


    // End of year updates to emmisions of a participant
    function update_participant(string memory name, uint emmisions, uint balance_change) public{
        require(
            msg.sender == admin,
            "Only admin can add."
        );

        participants[Names[name]].emmisions = emmisions;
        participants[Names[name]].balance = balance_change;
    }

    function make_sell_order(address seller, uint volume, uint sell_price) public{

            require(
                msg.sender == seller || msg.sender == admin
            );
            exchange_sell[num_sell_orders] = Sell_order({
                sell_price: sell_price,
                volume: volume,
                seller: seller
             });
            num_sell_orders += 1;

            // exchange_sell.push(Sell_order({
            //     sell_price: sell_price,
            //     volume: volume,
            //     seller: seller
            // })
            //);
    }

    function make_buy_order(address buyer, uint volume) public{

        require(
                msg.sender == buyer || msg.sender == admin
            );
        uint forced;
        if (msg.sender == admin){
          forced = 1;
        }
        else {
          forced = 0;
        }
        exchange_buy[num_buy_orders] = Buy_order({
            buyer: buyer,
            volume: volume,
            forced: forced
          });

          num_buy_orders += 1;

        // exchange_buy.push(Buy_order({
        //     buyer: buyer,
        //     volume: volume
        //   })
        // );
    }

    // To be called externally and periodically at the end of the year

  function issue_credits(address participant_address) public{

    require(
      msg.sender == admin
    );
    if (participants[participant_address].emmisions < emmision_limit){
      uint emmisions = participants[participant_address].emmisions;
      participants[participant_address].emmisions = 0;

      // Mint new coins
      participants[participant_address].carbon_credits = (2 * emmision_limit - emmisions) * exchange_rate;
    }
    else if (emmision_limit < participants[participant_address].emmisions){
      uint volume;
      volume = (participants[participant_address].emmisions - emmision_limit) * exchange_rate;
      force_to_buy(participant_address, volume);
      participants[participant_address].carbon_credits = emmision_limit * exchange_rate;
      participants[participant_address].emmisions = 0;
    }
  }

  function force_to_buy(address participant_address, uint volume) public{

    require(
      msg.sender == admin
    );
    participants[admin].carbon_credits += volume;
    uint sell_price = 75;
    make_sell_order(admin, volume, sell_price);

    make_buy_order(participant_address, volume);
  }

  //Order Matching
  address public buyer_market;
  address public seller_market;

  function match_order() public{

      require(
      msg.sender == admin
    );


    // Sort sell array: Sell -> Lowest price first if volume > 0

    for (uint i = 0; i < num_buy_orders; i++)  {

        buyer_market = exchange_buy[i].buyer;
        exchange_buy[i].volume -= 5;
        uint j = 0;

        while (exchange_buy[i].volume > 0 || j < num_sell_orders){
            seller_market = exchange_sell[j].seller;
            if (exchange_sell[j].volume >= exchange_buy[i].volume){
                if (exchange_buy[i].forced == 0){
                  participants[buyer_market].carbon_credits += exchange_buy[i].volume;
                }
                participants[buyer_market].balance -= exchange_sell[j].sell_price * exchange_buy[i].volume;
                participants[seller_market].balance += exchange_sell[j].sell_price * exchange_buy[i].volume;
                participants[seller_market].carbon_credits -= exchange_buy[i].volume;
                exchange_sell[j].volume -= exchange_buy[i].volume;
                exchange_buy[i].volume = 0;
            }

            else {
                if (exchange_buy[i].forced == 0){
                  participants[buyer_market].carbon_credits += exchange_sell[j].volume;
                }
                participants[buyer_market].balance -= exchange_sell[j].sell_price * exchange_sell[j].volume;
                participants[seller_market].balance += exchange_sell[j].sell_price * exchange_sell[j].volume;
                participants[seller_market].carbon_credits -= exchange_sell[j].volume;
                exchange_buy[i].volume -= exchange_sell[j].volume;
                exchange_sell[j].volume = 0;
            }

            j += 1;

            }
        }

  }


}
