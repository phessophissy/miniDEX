#!/bin/bash
cd ~/miniDEX

# Commit 1: Add loading state animation
sed -i 's/MiniDex Frontend Loaded/MiniDex Frontend v1.0 Loaded/' frontend/src/app.js
git add -A && git commit -m "feat(frontend): update app version identifier"

# Commit 2: Add console welcome message
sed -i '/MiniDex Frontend v1.0 Loaded/a console.log("Welcome to MiniDex - Your Stablecoin Swap Platform");' frontend/src/app.js
git add -A && git commit -m "feat(frontend): add welcome console message"

# Commit 3: Update header description
sed -i 's/Stablecoin swaps with near-zero slippage/Seamless stablecoin swaps with near-zero slippage/g' frontend/index.html
git add -A && git commit -m "docs(frontend): improve header description text"

# Commit 4: Add copyright year variable
sed -i 's/MiniDex © 2026/MiniDex © 2025-2026/' frontend/index.html
git add -A && git commit -m "docs(frontend): update copyright years"

# Commit 5: Add transaction count logging
sed -i '/Swap successful/a\        console.log("Transaction completed successfully");' frontend/src/app.js
git add -A && git commit -m "feat(frontend): add transaction success logging"

# Commit 6: Improve error message format
sed -i 's/Swap failed:/Swap transaction failed:/' frontend/src/app.js
git add -A && git commit -m "fix(frontend): improve error message clarity"

# Commit 7: Add network status log
sed -i '/Check network/a\        console.log("Checking network configuration...");' frontend/src/app.js
git add -A && git commit -m "feat(frontend): add network check logging"

# Commit 8: Update disconnect logging
sed -i '/function disconnectWallet/a\    console.log("Disconnecting wallet...");' frontend/src/app.js
git add -A && git commit -m "feat(frontend): add disconnect action logging"

# Commit 9: Improve balance formatting
sed -i 's/toFixed(2)/toFixed(4)/' frontend/src/app.js
git add -A && git commit -m "feat(frontend): increase balance decimal precision"

# Commit 10: Add slippage warning comment
sed -i '/Slippage Tolerance/i\                        <!-- Slippage configuration -->' frontend/index.html
git add -A && git commit -m "docs(frontend): add slippage config comment"

# Commit 11: Update exchange rate format
sed -i 's/toFixed(4)/toFixed(6)/' frontend/src/app.js
git add -A && git commit -m "feat(frontend): increase rate decimal precision"

# Commit 12: Add pool status logging
sed -i '/updatePoolStats/a\    console.log("Updating pool statistics...");' frontend/src/app.js
git add -A && git commit -m "feat(frontend): add pool stats update logging"

# Commit 13: Improve liquidity message
sed -i 's/Liquidity added!/Liquidity successfully added!/' frontend/src/app.js
git add -A && git commit -m "feat(frontend): improve liquidity success message"

# Commit 14: Add remove liquidity logging
sed -i 's/Liquidity removed!/Liquidity successfully removed!/' frontend/src/app.js
git add -A && git commit -m "feat(frontend): improve remove liquidity message"

# Commit 15: Add balance update log
sed -i '/async function updateBalances/a\    console.log("Refreshing wallet balances...");' frontend/src/app.js
git add -A && git commit -m "feat(frontend): add balance refresh logging"

# Commit 16: Update footer link text
sed -i 's/Built on Base Chain/Powered by Base Chain/' frontend/index.html
git add -A && git commit -m "docs(frontend): update footer branding"

# Commit 17: Add approval logging
sed -i 's/Approving token/Approving token transfer/' frontend/src/app.js
git add -A && git commit -m "feat(frontend): clarify token approval message"

# Commit 18: Improve connecting message
sed -i 's/Connecting.../Connecting to wallet.../' frontend/src/app.js
git add -A && git commit -m "ux(frontend): improve wallet connecting message"

# Commit 19: Add USDC approval log
sed -i 's/Approving USDC/Approving USDC token/' frontend/src/app.js
git add -A && git commit -m "feat(frontend): clarify USDC approval message"

# Commit 20: Add USDT approval log
sed -i 's/Approving USDT/Approving USDT token/' frontend/src/app.js
git add -A && git commit -m "feat(frontend): clarify USDT approval message"

# Commit 21: Add swap confirmation log
sed -i 's/Confirming swap/Confirming swap transaction/' frontend/src/app.js
git add -A && git commit -m "feat(frontend): clarify swap confirmation message"

# Commit 22: Add liquidity submission log
sed -i 's/Adding liquidity/Adding liquidity to pool/' frontend/src/app.js
git add -A && git commit -m "feat(frontend): clarify add liquidity message"

# Commit 23: Add remove liquidity log
sed -i 's/Removing liquidity/Removing liquidity from pool/' frontend/src/app.js
git add -A && git commit -m "feat(frontend): clarify remove liquidity message"

# Commit 24: Update button spinner text
sed -i 's/Swapping.../Processing swap.../' frontend/src/app.js
git add -A && git commit -m "ux(frontend): improve swap processing indicator"

# Commit 25: Update add liquidity button
sed -i 's/Adding.../Adding liquidity.../' frontend/src/app.js
git add -A && git commit -m "ux(frontend): improve add liquidity indicator"

echo "First 25 commits completed"

# Commit 26: Update remove liquidity button
sed -i 's/Removing.../Removing liquidity.../' frontend/src/app.js
git add -A && git commit -m "ux(frontend): improve remove liquidity indicator"

# Commit 27: Add transaction pending log
sed -i 's/Transaction submitted/Transaction pending confirmation/' frontend/src/app.js
git add -A && git commit -m "feat(frontend): clarify transaction status message"

# Commit 28: Update enter amount button
sed -i 's/Enter Amount/Enter Swap Amount/' frontend/src/app.js
git add -A && git commit -m "ux(frontend): clarify swap button placeholder"

# Commit 29: Update insufficient liquidity text
sed -i 's/Insufficient Liquidity/Insufficient Pool Liquidity/' frontend/src/app.js
git add -A && git commit -m "ux(frontend): clarify liquidity error message"

# Commit 30: Add contract initialization log
sed -i '/Initialize contracts/a\        console.log("Initializing smart contracts...");' frontend/src/app.js
git add -A && git commit -m "feat(frontend): add contract init logging"

# Commit 31: Update LP token message
sed -i 's/LP token not available yet/LP token contract not initialized yet/' frontend/src/app.js
git add -A && git commit -m "feat(frontend): clarify LP token error message"

# Commit 32: Add account change log
sed -i '/handleAccountsChanged/a\    console.log("Account change detected");' frontend/src/app.js
git add -A && git commit -m "feat(frontend): add account change logging"

# Commit 33: Update swap output log
sed -i '/Error calculating output/i\        console.log("Calculating swap output...");' frontend/src/app.js
git add -A && git commit -m "feat(frontend): add swap calculation logging"

# Commit 34: Add swap direction log
sed -i '/function switchSwapDirection/a\    console.log("Switching swap direction");' frontend/src/app.js
git add -A && git commit -m "feat(frontend): add direction switch logging"

# Commit 35: Update connection error message
sed -i 's/Failed to connect:/Wallet connection failed:/' frontend/src/app.js
git add -A && git commit -m "fix(frontend): improve connection error message"

# Commit 36: Add MetaMask prompt
sed -i 's/Please install MetaMask or another Web3 wallet/Please install MetaMask or a compatible Web3 wallet to continue/' frontend/src/app.js
git add -A && git commit -m "ux(frontend): improve wallet install message"

# Commit 37: Update allowance check log
sed -i '/Check allowance/a\        console.log("Checking token allowance...");' frontend/src/app.js
git add -A && git commit -m "feat(frontend): add allowance check logging"

# Commit 38: Add max button log
sed -i '/maxBtn.addEventListener/a\    console.log("Max button clicked");' frontend/src/app.js
git add -A && git commit -m "feat(frontend): add max button click logging"

# Commit 39: Add LP max button log
sed -i '/maxLpBtn.addEventListener/a\    console.log("LP Max button clicked");' frontend/src/app.js
git add -A && git commit -m "feat(frontend): add LP max button logging"

# Commit 40: Update connect button text
sed -i 's/Connect Wallet/Connect Your Wallet/' frontend/index.html
git add -A && git commit -m "ux(frontend): update connect button text"

# Commit 41: Add swap tab log
sed -i '/data-tab === .swap/a\            console.log("Switched to Swap tab");' frontend/src/app.js
git add -A && git commit -m "feat(frontend): add swap tab logging"

# Commit 42: Add liquidity tab log
sed -i '/swapTab.classList.add/a\            console.log("Switched to Liquidity tab");' frontend/src/app.js
git add -A && git commit -m "feat(frontend): add liquidity tab logging"

# Commit 43: Update add LP section log
sed -i '/data-lp-tab === .add/a\            console.log("Switched to Add Liquidity");' frontend/src/app.js
git add -A && git commit -m "feat(frontend): add LP add tab logging"

# Commit 44: Add remove LP section log
sed -i '/addLpSection.classList.add/a\            console.log("Switched to Remove Liquidity");' frontend/src/app.js
git add -A && git commit -m "feat(frontend): add LP remove tab logging"

# Commit 45: Update pool address log
sed -i 's/Pool Address:/Smart Contract Pool Address:/' frontend/src/app.js
git add -A && git commit -m "docs(frontend): clarify pool address label"

# Commit 46: Update USDC address log
sed -i 's/USDC Address:/USDC Token Address:/' frontend/src/app.js
git add -A && git commit -m "docs(frontend): clarify USDC address label"

# Commit 47: Update USDT address log
sed -i 's/USDT Address:/USDT Token Address:/' frontend/src/app.js
git add -A && git commit -m "docs(frontend): clarify USDT address label"

# Commit 48: Add initialization complete log
echo 'console.log("MiniDex initialization complete - Ready for trading");' >> frontend/src/app.js
git add -A && git commit -m "feat(frontend): add initialization complete message"

# Commit 49: Add version comment to HTML
sed -i '1i<!-- MiniDex Frontend v1.0 -->' frontend/index.html
git add -A && git commit -m "docs(frontend): add version comment to HTML"

# Commit 50: Add build timestamp
echo "// Last updated: $(date -Iseconds)" >> frontend/src/app.js
git add -A && git commit -m "chore(frontend): add build timestamp"

echo "All 50 commits completed!"
