var iota = core.composeAPI({
provider: 'https://nodes.devnet.iota.org:443'
});

	let urltag = window.location.pathname.slice(9, 18)
	if(urltag.length != 9){
		console.log("No shorturl found")
	} else

    	iota.findTransactionObjects({ tags: [urltag] })
	   .then(tags => {
	       console.log(`ADDRESS FOUND: ${tags[0].address}`) 
	       document.getElementById("app").innerHTML =tags[0].address;
	   })
	   .catch(err => {
	   });


async function send(address){
  try{
    var address = address
    if(address.length != 90){
      console.log("Address too short");
      return
    }
    var tag = address.slice(81, 90)
    if(address.slice(81, 90) != checksum.addChecksum(address.slice(0, 81)).slice(81, 90)){
      console.log("Invalid checksum");
      return
    }
    var transfers = [{
        address: address, 
        value: 0,
        tag: tag, 
    }]

    let trytes = await iota.prepareTransfers((seed = '9'.repeat(81)), transfers)
    let bundle = await iota.sendTrytes(trytes, (depth = 3), (minWeightMagnitude = 14))
    console.log(`TRANSACTION: ${bundle[0].hash}`)
  }
  catch (err) {
    console.log(err)
  }
}

async function getAddressWithTag(tag){
  try{
    let hashesWithTag = await iota.findTransactions({ tags: [tag] })
    let txObjects = await iota.getTransactionObjects(hashesWithTag)
    let results = []
	txObjects.forEach(tx => {
      let addressWithChecksum = checksum.addChecksum(tx.address)
      if(addressWithChecksum.slice(81, 90) == tag){
        results.push(addressWithChecksum)
      }
    })
	if(results.length == 0){
		console.log("No matching tx found with tag: "+tag)
		return
	}
	let equal = results.every( (val, i, arr) => val === arr[0] )
	if(equal == true){
    	console.log("Address found: "+results[0]);
	} else {
		console.error("Different addresses found")
	}
  } 
  catch (err) {
    console.error(err)
  }
}


async function runApp(){
  try{
    let address = document.getElementById("UserAddress").value;
	console.log("tag: "+address.slice(81, 90))
    if(address.slice(81, 90) != checksum.addChecksum(address.slice(0, 81)).slice(81, 90)){
      document.getElementById("app").innerHTML = "Your Address is invalid";
      return
    } else
    var link = document.createElement('a');
    link.textContent = 'https://miota.me/'+address.slice(81, 90);
    link.href = address.slice(81, 90);
    document.getElementById('app').appendChild(link);;
    await send(address)
    await new Promise(resolve => setTimeout(resolve, 1000));
    await getAddressWithTag(address.slice(81, 90))
  }
  catch(e){
    console.error(e);
  }
}