const INFURA_API_KEY = "d3011414c0114807911c1b6cea9d79f4"; // Ganti dengan API key Infura untuk Ethereum
const BSC_API_KEY = "7TE7WEGMD443RZJ9I1BDHVEFB5FEIKD6W9"; // Ganti dengan API key untuk BSC

async function generateMultipleSeedPhrases() {
  const numSeeds = parseInt(document.getElementById("num-seeds").value); // Mendapatkan jumlah seed yang diinginkan
  const seedResultsContainer = document.getElementById("seed-results");
  seedResultsContainer.innerHTML = ""; // Clear previous results

  // Loop untuk generate seed phrases sebanyak jumlah yang dimasukkan
  for (let i = 0; i < numSeeds; i++) {
    const randomMnemonic = ethers.utils.entropyToMnemonic(ethers.utils.randomBytes(16));
    const seedBox = document.createElement("div");
    seedBox.classList.add("seed-box");

    const seedText = document.createElement("p");
    seedText.textContent = `Seed Phrase ${i + 1}: ${randomMnemonic}`;
    seedBox.appendChild(seedText);

    // Call check wallet for each generated seed phrase
    checkWallet(randomMnemonic, seedBox);
    seedResultsContainer.appendChild(seedBox);
  }
}

async function getAddressFromSeed(seed) {
  const { ethers } = window.ethers;
  const wallet = ethers.Wallet.fromMnemonic(seed);
  return wallet;
}

async function getETHBalance(address) {
  const provider = new ethers.providers.InfuraProvider("mainnet", INFURA_API_KEY);
  const balance = await provider.getBalance(address);
  return ethers.utils.formatEther(balance);
}

async function getBSCBalance(address) {
  const provider = new ethers.providers.JsonRpcProvider(`https://bsc-dataseed.binance.org/`);
  const balance = await provider.getBalance(address);
  return ethers.utils.formatEther(balance);
}

async function getERC20Tokens(address, isBSC = false) {
  const tokens = [
    { symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 }, // USDT on Ethereum
    { symbol: "DAI",  address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals: 18 }  // DAI on Ethereum
  ];

  const abi = ["function balanceOf(address) view returns (uint256)"];
  const provider = isBSC 
    ? new ethers.providers.JsonRpcProvider(`https://bsc-dataseed.binance.org/`) // BSC
    : new ethers.providers.InfuraProvider("mainnet", INFURA_API_KEY); // Ethereum
  
  const results = [];

  for (const token of tokens) {
    const contract = new ethers.Contract(token.address, abi, provider);
    const bal = await contract.balanceOf(address);
    const formatted = ethers.utils.formatUnits(bal, token.decimals);
    results.push({ symbol: token.symbol, balance: formatted });
  }

  return results;
}

async function checkWallet(seed, seedBox) {
  const wallet = await getAddressFromSeed(seed);
  const address = wallet.address;
  
  const eth = await getETHBalance(address);
  const bnb = await getBSCBalance(address);
  const tokens = await getERC20Tokens(wallet.address);

  const walletInfo = document.createElement("div");

  const addressElem = document.createElement("p");
  addressElem.textContent = `Address: ${address}`;
  walletInfo.appendChild(addressElem);

  const ethElem = document.createElement("p");
  ethElem.textContent = `ETH Balance: ${eth} ETH`;
  walletInfo.appendChild(ethElem);

  const bnbElem = document.createElement("p");
  bnbElem.textContent = `BNB Balance: ${bnb} BNB`;
  walletInfo.appendChild(bnbElem);

  const tokenList = document.createElement("ul");
  tokens.forEach(t => {
    if (parseFloat(t.balance) > 0) {
      const li = document.createElement("li");
      li.textContent = `${t.balance} ${t.symbol}`;
      tokenList.appendChild(li);
    }
  });
  walletInfo.appendChild(tokenList);

  seedBox.appendChild(walletInfo);
}
