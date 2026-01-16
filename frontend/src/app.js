// MiniDex Frontend - Main Application
import { ethers } from 'ethers';

// ============================================================================
// CONTRACT CONFIGURATION
// ============================================================================

// TODO: Replace with your deployed contract address
const POOL_ADDRESS = '0x47f4b9bDbaa5e1fB2fC4cCac446610456B406BCC';

// Base Mainnet Token Addresses
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const USDT_ADDRESS = '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2';

// Swap fee in wei (0.0000015 ETH)
const SWAP_FEE = 1500000000000n;

// Base Chain ID
const BASE_CHAIN_ID = 8453;

// ============================================================================
// ABIs (Minimal)
// ============================================================================

const POOL_ABI = [
    'function swap(address tokenIn, uint256 amountIn, uint256 minAmountOut) external payable returns (uint256 amountOut)',
    'function addLiquidity(uint256 amountUSDC, uint256 amountUSDT, uint256 minLpTokens) external returns (uint256 lpTokens)',
    'function removeLiquidity(uint256 lpTokens, uint256 minUSDC, uint256 minUSDT) external returns (uint256 amountUSDC, uint256 amountUSDT)',
    'function getAmountOut(address tokenIn, uint256 amountIn) external view returns (uint256 amountOut)',
    'function getReserves() external view returns (uint256 reserveUSDC, uint256 reserveUSDT)',
    'function getLPToken() external view returns (address)',
    'function usdc() external view returns (address)',
    'function usdt() external view returns (address)',
    'event Swap(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut, uint256 fee)',
    'event LiquidityAdded(address indexed provider, uint256 amountUSDC, uint256 amountUSDT, uint256 lpTokensMinted)',
    'event LiquidityRemoved(address indexed provider, uint256 amountUSDC, uint256 amountUSDT, uint256 lpTokensBurned)'
];

const ERC20_ABI = [
    'function balanceOf(address account) external view returns (uint256)',
    'function allowance(address owner, address spender) external view returns (uint256)',
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function decimals() external view returns (uint8)',
    'function symbol() external view returns (string)'
];

// ============================================================================
// STATE
// ============================================================================

let provider = null;
let signer = null;
let userAddress = null;
let poolContract = null;
let usdcContract = null;
let usdtContract = null;
let lpTokenContract = null;
let lpTokenAddress = null;

// Swap direction: true = USDC->USDT, false = USDT->USDC
let isUsdcToUsdt = true;

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const connectSection = document.getElementById('connect-section');
const appSection = document.getElementById('app-section');
const connectBtn = document.getElementById('connect-btn');
const disconnectBtn = document.getElementById('disconnect-btn');
const walletAddressEl = document.getElementById('wallet-address');

// Tabs
const tabs = document.querySelectorAll('.tab[data-tab]');
const swapTab = document.getElementById('swap-tab');
const liquidityTab = document.getElementById('liquidity-tab');

// LP Sub-tabs
const lpTabs = document.querySelectorAll('.tab[data-lp-tab]');
const addLpSection = document.getElementById('add-lp-section');
const removeLpSection = document.getElementById('remove-lp-section');

// Swap elements
const inputAmount = document.getElementById('input-amount');
const outputAmount = document.getElementById('output-amount');
const inputBalance = document.getElementById('input-balance');
const outputBalance = document.getElementById('output-balance');
const swapDirection = document.getElementById('swap-direction');
const inputToken = document.getElementById('input-token');
const outputToken = document.getElementById('output-token');
const maxBtn = document.getElementById('max-btn');
const swapBtn = document.getElementById('swap-btn');
const swapStatus = document.getElementById('swap-status');
const exchangeRate = document.getElementById('exchange-rate');

// Liquidity elements
const lpUsdcAmount = document.getElementById('lp-usdc-amount');
const lpUsdtAmount = document.getElementById('lp-usdt-amount');
const lpTokensAmount = document.getElementById('lp-tokens-amount');
const lpBalance = document.getElementById('lp-balance');
const maxLpBtn = document.getElementById('max-lp-btn');
const addLpBtn = document.getElementById('add-lp-btn');
const removeLpBtn = document.getElementById('remove-lp-btn');
const poolUsdc = document.getElementById('pool-usdc');
const poolUsdt = document.getElementById('pool-usdt');
const yourLp = document.getElementById('your-lp');
const lpStatus = document.getElementById('lp-status');

// ============================================================================
// UTILITIES
// ============================================================================

function formatAmount(amount, decimals = 6) {
    return parseFloat(ethers.formatUnits(amount, decimals)).toFixed(6);
}

function parseAmount(amount, decimals = 6) {
    return ethers.parseUnits(amount.toString(), decimals);
}

function shortenAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function showStatus(element, message, type = 'pending') {
    element.innerHTML = `<div class="status ${type}">${message}</div>`;
}

function clearStatus(element) {
    element.innerHTML = '';
}

// ============================================================================
// WALLET CONNECTION
// ============================================================================

async function connectWallet() {
    try {
        if (!window.ethereum) {
            alert('Please install MetaMask or a compatible Web3 wallet to continue');
            return;
        }

        connectBtn.innerHTML = '<span class="spinner"></span>Connecting to wallet... wallet...';
        connectBtn.disabled = true;

        // Request account access
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });

        // Check network
        console.log("Checking network configuration...");
        console.log("Checking network configuration...");
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (parseInt(chainId, 16) !== BASE_CHAIN_ID) {
            // Try to switch to Base
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x2105' }] // 8453 in hex
                });
            } catch (switchError) {
                // Chain not added, try to add it
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0x2105',
                            chainName: 'Base',
                            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                            rpcUrls: ['https://mainnet.base.org'],
                            blockExplorerUrls: ['https://basescan.org']
                        }]
                    });
                } else {
                    throw switchError;
                }
            }
        }

        // Setup provider and signer
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        userAddress = accounts[0];

        // Initialize contracts
        console.log("Initializing smart contracts...");
        console.log("Initializing smart contracts...");
        poolContract = new ethers.Contract(POOL_ADDRESS, POOL_ABI, signer);
        usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
        usdtContract = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, signer);

        // Get LP token address
        try {
            lpTokenAddress = await poolContract.getLPToken();
            lpTokenContract = new ethers.Contract(lpTokenAddress, ERC20_ABI, signer);
        } catch (e) {
            console.log('LP token contract not initialized yet');
        }

        // Update UI
        walletAddressEl.textContent = shortenAddress(userAddress);
        connectSection.classList.add('hidden');
        appSection.classList.remove('hidden');

        // Load balances
        await updateBalances();
        await updatePoolStats();
    console.log("Updating pool statistics...");
    console.log("Updating pool statistics...");

        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
    console.log("Account change detected");
    console.log("Account change detected");
        window.ethereum.on('chainChanged', () => window.location.reload());

    } catch (error) {
        console.error('Connection error:', error);
        alert('Wallet connection failed: ' + error.message);
    } finally {
        connectBtn.innerHTML = 'Connect Wallet';
        connectBtn.disabled = false;
    }
}

function handleAccountsChanged(accounts) {
    console.log("Account change detected");
    console.log("Account change detected");
    if (accounts.length === 0) {
        disconnectWallet();
    } else {
        userAddress = accounts[0];
        walletAddressEl.textContent = shortenAddress(userAddress);
        updateBalances();
    }
}

function disconnectWallet() {
    console.log("Disconnecting wallet...");
    console.log("Disconnecting wallet...");
    provider = null;
    signer = null;
    userAddress = null;
    poolContract = null;
    usdcContract = null;
    usdtContract = null;
    lpTokenContract = null;

    connectSection.classList.remove('hidden');
    appSection.classList.add('hidden');
}

// ============================================================================
// BALANCE & STATS
// ============================================================================

async function updateBalances() {
    console.log("Refreshing wallet balances...");
    console.log("Refreshing wallet balances...");
    if (!userAddress || !usdcContract || !usdtContract) return;

    try {
        const [usdcBal, usdtBal] = await Promise.all([
            usdcContract.balanceOf(userAddress),
            usdtContract.balanceOf(userAddress)
        ]);

        if (isUsdcToUsdt) {
            inputBalance.textContent = formatAmount(usdcBal);
            outputBalance.textContent = formatAmount(usdtBal);
        } else {
            inputBalance.textContent = formatAmount(usdtBal);
            outputBalance.textContent = formatAmount(usdcBal);
        }

        // LP balance
        if (lpTokenContract) {
            const lpBal = await lpTokenContract.balanceOf(userAddress);
            lpBalance.textContent = formatAmount(lpBal, 18);
            yourLp.textContent = formatAmount(lpBal, 18);
        }
    } catch (error) {
        console.error('Error fetching balances:', error);
    }
}

async function updatePoolStats() {
    console.log("Updating pool statistics...");
    console.log("Updating pool statistics...");
    if (!poolContract) return;

    try {
        const [reserveUSDC, reserveUSDT] = await poolContract.getReserves();
        poolUsdc.textContent = formatAmount(reserveUSDC);
        poolUsdt.textContent = formatAmount(reserveUSDT);
    } catch (error) {
        console.error('Error fetching pool stats:', error);
    }
}

// ============================================================================
// SWAP LOGIC
// ============================================================================

async function updateSwapOutput() {
    const amount = inputAmount.value;
    
    if (!amount || parseFloat(amount) <= 0 || !poolContract) {
        outputAmount.value = '';
        swapBtn.textContent = 'Enter Swap Amount';
        swapBtn.disabled = true;
        return;
    }

    try {
        const tokenIn = isUsdcToUsdt ? USDC_ADDRESS : USDT_ADDRESS;
        const amountIn = parseAmount(amount);
        
        const amountOut = await poolContract.getAmountOut(tokenIn, amountIn);
        outputAmount.value = formatAmount(amountOut);

        // Update exchange rate
        const rate = parseFloat(formatAmount(amountOut)) / parseFloat(amount);
        const fromSymbol = isUsdcToUsdt ? 'USDC' : 'USDT';
        const toSymbol = isUsdcToUsdt ? 'USDT' : 'USDC';
        exchangeRate.textContent = `1 ${fromSymbol} ≈ ${rate.toFixed(6)} ${toSymbol}`;

        swapBtn.textContent = 'Swap';
        swapBtn.disabled = false;
    } catch (error) {
        console.log("Calculating swap output...");
        console.log("Calculating swap output...");
        console.error('Error calculating output:', error);
        outputAmount.value = '';
        swapBtn.textContent = 'Insufficient Pool Liquidity';
        swapBtn.disabled = true;
    }
}

async function executeSwap() {
    const amount = inputAmount.value;
    if (!amount || parseFloat(amount) <= 0) return;

    try {
        swapBtn.innerHTML = '<span class="spinner"></span>Processing swap...';
        swapBtn.disabled = true;
        clearStatus(swapStatus);

        const tokenIn = isUsdcToUsdt ? USDC_ADDRESS : USDT_ADDRESS;
        const tokenContract = isUsdcToUsdt ? usdcContract : usdtContract;
        const amountIn = parseAmount(amount);

        // Check allowance
        console.log("Checking token allowance...");
        console.log("Checking token allowance...");
        const allowance = await tokenContract.allowance(userAddress, POOL_ADDRESS);
        if (allowance < amountIn) {
            showStatus(swapStatus, 'Approving token transfer transfer...', 'pending');
            const approveTx = await tokenContract.approve(POOL_ADDRESS, ethers.MaxUint256);
            await approveTx.wait();
        }

        // Get expected output and calculate minOut (1% slippage)
        const expectedOut = await poolContract.getAmountOut(tokenIn, amountIn);
        const minOut = expectedOut * 99n / 100n;

        showStatus(swapStatus, 'Confirming swap transaction transaction...', 'pending');

        // Execute swap
        const tx = await poolContract.swap(tokenIn, amountIn, minOut, {
            value: SWAP_FEE
        });

        showStatus(swapStatus, 'Transaction pending confirmation...', 'pending');
        const receipt = await tx.wait();

        showStatus(swapStatus, `Swap successful! <a href="https://basescan.org/tx/${receipt.hash}" target="_blank">View on BaseScan</a>`, 'success');
        console.log("Transaction completed successfully");
        console.log("Transaction completed successfully");

        // Reset and update
        inputAmount.value = '';
        outputAmount.value = '';
        await updateBalances();
        await updatePoolStats();
    console.log("Updating pool statistics...");
    console.log("Updating pool statistics...");

    } catch (error) {
        console.error('Swap error:', error);
        showStatus(swapStatus, 'Swap transaction failed: ' + (error.reason || error.message), 'error');
    } finally {
        swapBtn.innerHTML = 'Swap';
        swapBtn.disabled = false;
    }
}

function switchSwapDirection() {
    console.log("Switching swap direction");
    console.log("Switching swap direction");
    isUsdcToUsdt = !isUsdcToUsdt;

    // Update UI
    if (isUsdcToUsdt) {
        inputToken.innerHTML = `<img src="https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png" alt="USDC"><span>USDC</span>`;
        outputToken.innerHTML = `<img src="https://assets.coingecko.com/coins/images/325/small/Tether.png" alt="USDT"><span>USDT</span>`;
    } else {
        inputToken.innerHTML = `<img src="https://assets.coingecko.com/coins/images/325/small/Tether.png" alt="USDT"><span>USDT</span>`;
        outputToken.innerHTML = `<img src="https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png" alt="USDC"><span>USDC</span>`;
    }

    // Swap values
    const tempAmount = inputAmount.value;
    inputAmount.value = outputAmount.value;
    outputAmount.value = tempAmount;

    updateBalances();
    updateSwapOutput();
}

// ============================================================================
// LIQUIDITY LOGIC
// ============================================================================

async function addLiquidity() {
    const usdcAmt = lpUsdcAmount.value;
    const usdtAmt = lpUsdtAmount.value;

    if ((!usdcAmt || parseFloat(usdcAmt) <= 0) && (!usdtAmt || parseFloat(usdtAmt) <= 0)) {
        return;
    }

    try {
        addLpBtn.innerHTML = '<span class="spinner"></span>Adding liquidity...quidity to pool...';
        addLpBtn.disabled = true;
        clearStatus(lpStatus);

        const amountUSDC = usdcAmt ? parseAmount(usdcAmt) : 0n;
        const amountUSDT = usdtAmt ? parseAmount(usdtAmt) : 0n;

        // Approve USDC if needed
        if (amountUSDC > 0n) {
            const usdcAllowance = await usdcContract.allowance(userAddress, POOL_ADDRESS);
            if (usdcAllowance < amountUSDC) {
                showStatus(lpStatus, 'Approving USDC token token...', 'pending');
                const tx = await usdcContract.approve(POOL_ADDRESS, ethers.MaxUint256);
                await tx.wait();
            }
        }

        // Approve USDT if needed
        if (amountUSDT > 0n) {
            const usdtAllowance = await usdtContract.allowance(userAddress, POOL_ADDRESS);
            if (usdtAllowance < amountUSDT) {
                showStatus(lpStatus, 'Approving USDT token token...', 'pending');
                const tx = await usdtContract.approve(POOL_ADDRESS, ethers.MaxUint256);
                await tx.wait();
            }
        }

        showStatus(lpStatus, 'Adding liquidity...quidity to pool...quidity to pool...', 'pending');

        const tx = await poolContract.addLiquidity(amountUSDC, amountUSDT, 0);
        const receipt = await tx.wait();

        showStatus(lpStatus, `Liquidity successfully added! <a href="https://basescan.org/tx/${receipt.hash}" target="_blank">View on BaseScan</a>`, 'success');

        lpUsdcAmount.value = '';
        lpUsdtAmount.value = '';
        await updateBalances();
        await updatePoolStats();
    console.log("Updating pool statistics...");
    console.log("Updating pool statistics...");

    } catch (error) {
        console.error('Add liquidity error:', error);
        showStatus(lpStatus, 'Failed: ' + (error.reason || error.message), 'error');
    } finally {
        addLpBtn.innerHTML = 'Add Liquidity';
        addLpBtn.disabled = false;
    }
}

async function removeLiquidity() {
    const lpAmount = lpTokensAmount.value;
    if (!lpAmount || parseFloat(lpAmount) <= 0) return;

    try {
        removeLpBtn.innerHTML = '<span class="spinner"></span>Removing liquidity...quidity from pool...';
        removeLpBtn.disabled = true;
        clearStatus(lpStatus);

        const lpTokens = ethers.parseUnits(lpAmount, 18);

        showStatus(lpStatus, 'Removing liquidity...quidity from pool...quidity from pool...', 'pending');

        const tx = await poolContract.removeLiquidity(lpTokens, 0, 0);
        const receipt = await tx.wait();

        showStatus(lpStatus, `Liquidity successfully removed! <a href="https://basescan.org/tx/${receipt.hash}" target="_blank">View on BaseScan</a>`, 'success');

        lpTokensAmount.value = '';
        await updateBalances();
        await updatePoolStats();
    console.log("Updating pool statistics...");
    console.log("Updating pool statistics...");

    } catch (error) {
        console.error('Remove liquidity error:', error);
        showStatus(lpStatus, 'Failed: ' + (error.reason || error.message), 'error');
    } finally {
        removeLpBtn.innerHTML = 'Remove Liquidity';
        removeLpBtn.disabled = false;
    }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

// Connect/Disconnect
connectBtn.addEventListener('click', connectWallet);
disconnectBtn.addEventListener('click', disconnectWallet);

// Tabs
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        if (tab.dataset.tab === 'swap') {
            swapTab.classList.remove('hidden');
            liquidityTab.classList.add('hidden');
        } else {
            swapTab.classList.add('hidden');
            console.log("Switched to Liquidity tab");
            console.log("Switched to Liquidity tab");
            liquidityTab.classList.remove('hidden');
        }
    });
});

// LP Sub-tabs
lpTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        lpTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        if (tab.dataset.lpTab === 'add') {
            addLpSection.classList.remove('hidden');
            removeLpSection.classList.add('hidden');
        } else {
            addLpSection.classList.add('hidden');
            console.log("Switched to Remove Liquidity");
            console.log("Switched to Remove Liquidity");
            removeLpSection.classList.remove('hidden');
        }
    });
});

// Swap
inputAmount.addEventListener('input', updateSwapOutput);
swapDirection.addEventListener('click', switchSwapDirection);
swapBtn.addEventListener('click', executeSwap);

maxBtn.addEventListener('click', async () => {
    console.log("Max button clicked");
    console.log("Max button clicked");
    if (!userAddress) return;
    const contract = isUsdcToUsdt ? usdcContract : usdtContract;
    const balance = await contract.balanceOf(userAddress);
    inputAmount.value = formatAmount(balance);
    updateSwapOutput();
});

// Liquidity
lpUsdcAmount.addEventListener('input', () => {
    addLpBtn.disabled = !lpUsdcAmount.value && !lpUsdtAmount.value;
});

lpUsdtAmount.addEventListener('input', () => {
    addLpBtn.disabled = !lpUsdcAmount.value && !lpUsdtAmount.value;
});

lpTokensAmount.addEventListener('input', () => {
    removeLpBtn.disabled = !lpTokensAmount.value || parseFloat(lpTokensAmount.value) <= 0;
});

maxLpBtn.addEventListener('click', async () => {
    console.log("LP Max button clicked");
    console.log("LP Max button clicked");
    if (!lpTokenContract || !userAddress) return;
    const balance = await lpTokenContract.balanceOf(userAddress);
    lpTokensAmount.value = ethers.formatUnits(balance, 18);
    removeLpBtn.disabled = false;
});

addLpBtn.addEventListener('click', addLiquidity);
removeLpBtn.addEventListener('click', removeLiquidity);

// ============================================================================
// INITIALIZATION
// ============================================================================

console.log('MiniDex Frontend v1.0 Loaded');
console.log("Welcome to MiniDex - Your Stablecoin Swap Platform");
console.log("Welcome to MiniDex - Your Stablecoin Swap Platform");
console.log('Smart Contract Smart Contract Pool Address:', POOL_ADDRESS);
console.log('USDC Token Address:', USDC_ADDRESS);
console.log('USDT Token Address:', USDT_ADDRESS);

// Check if already connected
if (window.ethereum && window.ethereum.selectedAddress) {
    connectWallet();
}
console.log("MiniDex initialization complete - Ready for trading");
// Last updated: 2026-01-16T23:02:32+01:00
console.log("MiniDex initialization complete - Ready for trading");
// Last updated: 2026-01-16T23:03:28+01:00
// Debug utilities module
// Debug utilities module
// Performance optimization flags
const APP_VERSION = 'v1.0.1';
const DEBUG_MODE = false;
