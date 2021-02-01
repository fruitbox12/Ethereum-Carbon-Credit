App = {
	loading : false,
  contracts : {},
  view_address : '',

	load: async () => {
		// Load app...
		console.log("app loading...")
		await App.loadWeb3()
		await App.loadAccount()
		await App.loadContract()
    await App.render()
    await App.viewAdmin()
	},

	// https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      window.alert("Please connect to Metamask.")
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        // Request account access if needed
        await ethereum.enable()
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */})
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */})
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

	loadAccount : async () => {
		// Set the current blockchain account
    App.account = web3.eth.accounts[0]
	},

	loadContract : async () => {
		// Create a JavaScript version of the smart contract
		const carbonCredit = await $.getJSON('CarbonCredit.json')
		App.contracts.CarbonCredit = TruffleContract(carbonCredit)
		App.contracts.CarbonCredit.setProvider(App.web3Provider)

		// Hydrate the smart contract with values from the blockchain
    App.carbonCredit = await App.contracts.CarbonCredit.deployed()
    // console.log(App.carbonCredit)


	},

  viewAdmin : async () => {
    const admin = await App.carbonCredit.admin()
    console.log('Admin : ', admin.toString())
  },

  render : async () => {
		// Prevent double render
		if (App.loading) {
			return
			}
		// Update app loading state
    App.setLoading(true)



    // let address = document.getElementById('Initialize_Address').value
    // console.log(address)
    // let _p = await App.carbonCredit.participants(String(address))
    // console.log(parseInt(_p[2]))
    // console.log(String(_p[3]))


		// Update loading state
		App.setLoading(false)
  },

  viewParticipant : async() => {
    App.view_address = document.getElementById('View_Address').value
    console.log(App.view_address)
    let _p = await App.carbonCredit.participants(App.view_address)
    // console.log('-------')
    // console.log(parseInt(_p[0]))
    // console.log(parseInt(_p[1]))
    // console.log(parseInt(_p[2]))
    // console.log(String(_p[3]))
    // console.log('-------')
    document.getElementById('View_Participant_Name').innerHTML = String(_p[3])
    document.getElementById('View_Participant_Balance').innerHTML = parseInt(_p[2])
    document.getElementById('View_Participant_Emmisions').innerHTML = parseInt(_p[1])
    document.getElementById('View_Participant_CarbonCredit').innerHTML = parseInt(_p[0])
  },

  viewBuyOrders : async() => {
    const numOrders = await App.carbonCredit.num_buy_orders()
    console.log('-------')
    console.log(parseInt(numOrders))
    console.log('-------')
    for (var i = 0 ; i < parseInt(numOrders); i++){

      let _o = await App.carbonCredit.exchange_buy(i)
      console.log('-------')
      console.log(String(_o[1]))
      console.log(parseInt(_o[0]))
      console.log('-------')
      document.getElementById('View_Buy_Orders_Address'.concat(String(i))).innerHTML = String(_o[1])
      document.getElementById('View_Buy_Orders_Volume'.concat(String(i))).innerHTML = parseInt(_o[0])
    }
  },

	viewSellOrders : async() => {
    const numSellOrders = await App.carbonCredit.num_sell_orders()
    console.log('-------')
    console.log(parseInt(numSellOrders))
    console.log('-------')
    for (var i = 0 ; i < parseInt(numSellOrders); i++){

      let _so = await App.carbonCredit.exchange_sell(i)
      console.log('-------')
      console.log(String(_so[1]))
      console.log(parseInt(_so[0]))
      console.log('-------')
      document.getElementById('View_Sell_Orders_Address'.concat(String(i))).innerHTML = String(_so[2])
      document.getElementById('View_Sell_Orders_Volume'.concat(String(i))).innerHTML = parseInt(_so[1])
			document.getElementById('View_Sell_Orders_Price'.concat(String(i))).innerHTML = parseInt(_so[0])
    }
  },

  initializeParticipant : async() => {
    const address = document.getElementById('Initialize_Address').value
    const balance = document.getElementById('Initialize_Balance').value
    const name = document.getElementById('Initialize_Name').value
    try {
      console.log('ok : ',ok)
      if (ok == true){
        console.log('participant initializing')
        await App.carbonCredit.initialize_participants(String(address), parseInt(balance), String(name))
        console.log('participant initialized')
        ok == false
      }
    }
    catch(err) {
      console.log('error while initizlizing participant')
      window.alert(err);
    }
    finally {
      window.location.reload()
    }
  },

  updateParticipant : async() => {
    const name = document.getElementById('Update_Name').value
    const emissions = document.getElementById('Update_Emissions').value
    const balance_change = document.getElementById('Update_Balance').value
    try {
      console.log('ok : ',ok)
      if (ok == true){
        console.log('participant updating')
        await App.carbonCredit.update_participant(String(name), parseInt(emissions), parseInt(balance_change))
        console.log('participant updated')
        ok == false
      }
    }
    catch(err) {
      console.log('error while updating participant')
      window.alert(err);
    }
    finally {
      window.location.reload()
    }
  },

  issueCredits : async() => {
    const address = document.getElementById('Issue_Credits_Address').value
    try {
      console.log('ok : ',ok)
      if (ok == true){
        console.log('issuing credits')
        await App.carbonCredit.issue_credits(String(address))
        console.log('issued credits')
        ok == false
      }
    }
    catch(err) {
      console.log('error while issuing credits')
      window.alert(err);
    }
    finally {
      window.location.reload()
    }
  },

  matchOrder : async() => {
    try {
      console.log('ok : ',ok)
      if (ok == true){
        console.log('matching orders')
        await App.carbonCredit.match_order()
        console.log('matched orders')
        ok == false
      }
    }
    catch(err) {
      console.log('error while matching orders')
      window.alert(err);
    }
    finally {
      window.location.reload()
    }
  },

  buy : async() => {
    const address = document.getElementById('Buy_Address').value
    const volume = document.getElementById('Buy_Volume').value
    try {
      console.log('ok : ',ok)
      if (ok == true){
        console.log('placing buy order')
        await App.carbonCredit.make_buy_order(String(address), parseInt(volume))
        console.log('placed buy order')
        ok == false
      }
    }
    catch(err) {
      console.log('error while placing buy order')
      window.alert(err);
    }
    finally {
      window.location.reload()
    }
  },

  sell : async() => {
    const address = document.getElementById('Sell_Address').value
    const volume = document.getElementById('Sell_Volume').value
    const price = document.getElementById('Sell_Price').value
    try {
      console.log('ok : ',ok)
      if (ok == true){
        console.log('placing sell order')
        await App.carbonCredit.make_sell_order(String(address), parseInt(volume), parseInt(price))
        console.log('placed sell order')
        ok == false
      }
    }
    catch(err) {
      console.log('error while placing sell order')
      window.alert(err);
    }
    finally {
      window.location.reload()
    }
  },



	setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    if (boolean) {
      loader.show()
      content.hide()
    } else {
      loader.hide()
      content.show()
    }
  }

}

var ok = true;

$(() => {
	$(window).load(()=>{
    console.log("Loading")
		App.load()
	})
})
