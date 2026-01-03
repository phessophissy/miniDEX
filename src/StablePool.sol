// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IERC20.sol";
import "./interfaces/IStablePool.sol";
import "./LPToken.sol";

/// @title StablePool - Minimal Stablecoin DEX Pool
/// @notice USDC/USDT swap pool optimized for 1:1 peg with near-zero slippage
/// @dev Uses simplified stable-swap invariant for minimal gas and maximum clarity
/// @author MiniDex
contract StablePool is IStablePool {
    /*//////////////////////////////////////////////////////////////
                                CONSTANTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Fixed platform fee per swap (0.0000015 ETH)
    uint256 public constant SWAP_FEE = 1_500_000_000_000; // 1.5e12 wei = 0.0000015 ETH

    /// @notice Amplification coefficient for stable-swap curve
    /// @dev Higher A = closer to constant-sum, lower slippage for stables
    /// A = 100 is typical for stablecoin pools
    uint256 public constant A = 100;

    /// @notice Precision for internal calculations
    uint256 private constant PRECISION = 1e18;

    /// @notice Number of tokens in pool (always 2 for this implementation)
    uint256 private constant N_COINS = 2;

    /*//////////////////////////////////////////////////////////////
                              IMMUTABLES
    //////////////////////////////////////////////////////////////*/

    /// @notice USDC token address (Base Mainnet)
    IERC20 public immutable usdc;

    /// @notice USDT token address (Base Mainnet)
    IERC20 public immutable usdt;

    /// @notice LP token for this pool
    LPToken public immutable lpToken;

    /// @notice Address receiving swap fees
    address public immutable feeRecipient;

    /// @notice USDC decimal multiplier (to normalize to 18 decimals)
    uint256 private immutable usdcMultiplier;

    /// @notice USDT decimal multiplier (to normalize to 18 decimals)
    uint256 private immutable usdtMultiplier;

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/

    /// @notice Current USDC reserve (in native decimals)
    uint256 public reserveUSDC;

    /// @notice Current USDT reserve (in native decimals)
    uint256 public reserveUSDT;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /// @param _usdc USDC token address
    /// @param _usdt USDT token address
    /// @param _feeRecipient Address to receive swap fees
    constructor(address _usdc, address _usdt, address _feeRecipient) {
        require(_usdc != address(0), "StablePool: zero USDC");
        require(_usdt != address(0), "StablePool: zero USDT");
        require(_feeRecipient != address(0), "StablePool: zero feeRecipient");

        usdc = IERC20(_usdc);
        usdt = IERC20(_usdt);
        feeRecipient = _feeRecipient;

        // Create LP token with this contract as the minter
        lpToken = new LPToken(address(this));

        // Calculate decimal multipliers for normalization
        // Both USDC and USDT have 6 decimals, but we handle any case
        uint8 usdcDecimals = IERC20(_usdc).decimals();
        uint8 usdtDecimals = IERC20(_usdt).decimals();
        
        usdcMultiplier = 10 ** (18 - usdcDecimals);
        usdtMultiplier = 10 ** (18 - usdtDecimals);
    }

    /*//////////////////////////////////////////////////////////////
                            LIQUIDITY LOGIC
    //////////////////////////////////////////////////////////////*/

    /// @inheritdoc IStablePool
    function addLiquidity(
        uint256 amountUSDC,
        uint256 amountUSDT,
        uint256 minLpTokens
    ) external returns (uint256 lpTokensMinted) {
        require(amountUSDC > 0 || amountUSDT > 0, "StablePool: zero amounts");

        uint256 totalSupply = lpToken.totalSupply();

        if (totalSupply == 0) {
            // First deposit: LP tokens = sum of normalized amounts
            lpTokensMinted = (amountUSDC * usdcMultiplier) + (amountUSDT * usdtMultiplier);
            require(lpTokensMinted > 0, "StablePool: insufficient initial liquidity");
        } else {
            // Subsequent deposits: proportional to existing liquidity
            // Calculate based on total normalized reserves
            uint256 totalReserves = (reserveUSDC * usdcMultiplier) + (reserveUSDT * usdtMultiplier);
            uint256 depositValue = (amountUSDC * usdcMultiplier) + (amountUSDT * usdtMultiplier);
            
            lpTokensMinted = (depositValue * totalSupply) / totalReserves;
        }

        require(lpTokensMinted >= minLpTokens, "StablePool: slippage");

        // Transfer tokens in
        if (amountUSDC > 0) {
            _safeTransferFrom(usdc, msg.sender, address(this), amountUSDC);
            reserveUSDC += amountUSDC;
        }
        if (amountUSDT > 0) {
            _safeTransferFrom(usdt, msg.sender, address(this), amountUSDT);
            reserveUSDT += amountUSDT;
        }

        // Mint LP tokens
        lpToken.mint(msg.sender, lpTokensMinted);

        emit LiquidityAdded(msg.sender, amountUSDC, amountUSDT, lpTokensMinted);
    }

    /// @inheritdoc IStablePool
    function removeLiquidity(
        uint256 lpTokens,
        uint256 minUSDC,
        uint256 minUSDT
    ) external returns (uint256 amountUSDC, uint256 amountUSDT) {
        require(lpTokens > 0, "StablePool: zero LP tokens");

        uint256 totalSupply = lpToken.totalSupply();
        require(totalSupply > 0, "StablePool: no liquidity");

        // Calculate proportional amounts
        amountUSDC = (lpTokens * reserveUSDC) / totalSupply;
        amountUSDT = (lpTokens * reserveUSDT) / totalSupply;

        require(amountUSDC >= minUSDC, "StablePool: USDC slippage");
        require(amountUSDT >= minUSDT, "StablePool: USDT slippage");

        // Burn LP tokens first (checks balance)
        lpToken.burn(msg.sender, lpTokens);

        // Update reserves
        reserveUSDC -= amountUSDC;
        reserveUSDT -= amountUSDT;

        // Transfer tokens out
        if (amountUSDC > 0) {
            _safeTransfer(usdc, msg.sender, amountUSDC);
        }
        if (amountUSDT > 0) {
            _safeTransfer(usdt, msg.sender, amountUSDT);
        }

        emit LiquidityRemoved(msg.sender, amountUSDC, amountUSDT, lpTokens);
    }

    /*//////////////////////////////////////////////////////////////
                              SWAP LOGIC
    //////////////////////////////////////////////////////////////*/

    /// @inheritdoc IStablePool
    function swap(
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut
    ) external payable returns (uint256 amountOut) {
        require(msg.value == SWAP_FEE, "StablePool: incorrect fee");
        require(amountIn > 0, "StablePool: zero amount");

        // Validate token and determine direction
        bool isUsdcIn = tokenIn == address(usdc);
        require(isUsdcIn || tokenIn == address(usdt), "StablePool: invalid token");

        // Calculate output using stable-swap math
        amountOut = _calculateSwapOutput(amountIn, isUsdcIn);
        require(amountOut >= minAmountOut, "StablePool: slippage");

        // Check sufficient output reserves
        if (isUsdcIn) {
            require(amountOut <= reserveUSDT, "StablePool: insufficient USDT");
        } else {
            require(amountOut <= reserveUSDC, "StablePool: insufficient USDC");
        }

        // Transfer input token in
        IERC20 inputToken = isUsdcIn ? usdc : usdt;
        _safeTransferFrom(inputToken, msg.sender, address(this), amountIn);

        // Update reserves
        if (isUsdcIn) {
            reserveUSDC += amountIn;
            reserveUSDT -= amountOut;
        } else {
            reserveUSDT += amountIn;
            reserveUSDC -= amountOut;
        }

        // Transfer output token out
        IERC20 outputToken = isUsdcIn ? usdt : usdc;
        _safeTransfer(outputToken, msg.sender, amountOut);

        // Send fee to recipient
        (bool success, ) = feeRecipient.call{value: SWAP_FEE}("");
        require(success, "StablePool: fee transfer failed");

        emit Swap(
            msg.sender,
            tokenIn,
            address(outputToken),
            amountIn,
            amountOut,
            SWAP_FEE
        );
    }

    /*//////////////////////////////////////////////////////////////
                              VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @inheritdoc IStablePool
    function getReserves() external view returns (uint256, uint256) {
        return (reserveUSDC, reserveUSDT);
    }

    /// @inheritdoc IStablePool
    function getAmountOut(
        address tokenIn,
        uint256 amountIn
    ) external view returns (uint256 amountOut) {
        require(amountIn > 0, "StablePool: zero amount");
        
        bool isUsdcIn = tokenIn == address(usdc);
        require(isUsdcIn || tokenIn == address(usdt), "StablePool: invalid token");

        return _calculateSwapOutput(amountIn, isUsdcIn);
    }

    /// @notice Get the LP token address
    /// @return Address of the LP token contract
    function getLPToken() external view returns (address) {
        return address(lpToken);
    }

    /*//////////////////////////////////////////////////////////////
                           STABLE-SWAP MATH
    //////////////////////////////////////////////////////////////*/

    /// @notice Calculate swap output using simplified stable-swap invariant
    /// @dev Uses the stable-swap formula optimized for 2 coins:
    ///      The invariant is: A*n^n*sum + D = A*D*n^n + D^(n+1)/(n^n*prod)
    ///      For efficiency, we use a simplified approach that maintains near-1:1 
    ///      exchange rate while accounting for pool imbalance
    /// @param amountIn Input amount (native decimals)
    /// @param isUsdcIn True if USDC is input, false if USDT
    /// @return amountOut Output amount (native decimals)
    function _calculateSwapOutput(
        uint256 amountIn,
        bool isUsdcIn
    ) internal view returns (uint256 amountOut) {
        // Normalize to 18 decimals for calculation
        uint256 normalizedIn = isUsdcIn 
            ? amountIn * usdcMultiplier 
            : amountIn * usdtMultiplier;

        uint256 normalizedReserveIn = isUsdcIn
            ? reserveUSDC * usdcMultiplier
            : reserveUSDT * usdtMultiplier;

        uint256 normalizedReserveOut = isUsdcIn
            ? reserveUSDT * usdtMultiplier
            : reserveUSDC * usdcMultiplier;

        // Calculate using stable-swap formula
        // For stablecoins, we use: out = in * reserveOut / (reserveIn + in)
        // But adjusted with amplification factor to keep closer to 1:1
        
        uint256 sum = normalizedReserveIn + normalizedReserveOut;
        if (sum == 0) return 0;

        // Amplified constant-sum component (tends toward 1:1)
        uint256 constantSumOut = normalizedIn;

        // Constant-product component (for safety at extremes)  
        uint256 constantProductOut = (normalizedIn * normalizedReserveOut) / 
            (normalizedReserveIn + normalizedIn);

        // Weighted average: higher A = more constant-sum behavior
        // Formula: out = (A * constantSumOut + constantProductOut) / (A + 1)
        uint256 normalizedOut = (A * constantSumOut + constantProductOut) / (A + 1);

        // Cap output at available reserves
        if (normalizedOut > normalizedReserveOut) {
            normalizedOut = normalizedReserveOut;
        }

        // Convert back to native decimals
        uint256 outMultiplier = isUsdcIn ? usdtMultiplier : usdcMultiplier;
        amountOut = normalizedOut / outMultiplier;
    }

    /*//////////////////////////////////////////////////////////////
                          SAFE TRANSFER HELPERS
    //////////////////////////////////////////////////////////////*/

    /// @notice Safely transfer tokens (handles non-standard ERC20s like USDT)
    function _safeTransfer(IERC20 token, address to, uint256 amount) internal {
        (bool success, bytes memory data) = address(token).call(
            abi.encodeWithSelector(IERC20.transfer.selector, to, amount)
        );
        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            "StablePool: transfer failed"
        );
    }

    /// @notice Safely transfer tokens from sender
    function _safeTransferFrom(
        IERC20 token,
        address from,
        address to,
        uint256 amount
    ) internal {
        (bool success, bytes memory data) = address(token).call(
            abi.encodeWithSelector(IERC20.transferFrom.selector, from, to, amount)
        );
        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            "StablePool: transferFrom failed"
        );
    }

    /*//////////////////////////////////////////////////////////////
                              RECEIVE ETH
    //////////////////////////////////////////////////////////////*/

    /// @notice Reject direct ETH transfers (fees must go through swap)
    receive() external payable {
        revert("StablePool: use swap()");
    }
}
