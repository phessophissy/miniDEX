// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title LPToken - Liquidity Provider Token for MiniDex
/// @notice Minimal ERC20 implementation for LP tokens
/// @dev No external dependencies, fully self-contained
contract LPToken {
    /*//////////////////////////////////////////////////////////////
                                 METADATA
    //////////////////////////////////////////////////////////////*/

    string public constant name = "MiniDex USDC-USDT LP";
    string public constant symbol = "mDEX-LP";
    uint8 public constant decimals = 18;

    /*//////////////////////////////////////////////////////////////
                              ERC20 STORAGE
    //////////////////////////////////////////////////////////////*/

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(address indexed owner, address indexed spender, uint256 amount);

    /*//////////////////////////////////////////////////////////////
                               MINTER ROLE
    //////////////////////////////////////////////////////////////*/

    /// @notice The StablePool contract that can mint/burn LP tokens
    address public immutable pool;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /// @param _pool Address of the StablePool contract
    constructor(address _pool) {
        require(_pool != address(0), "LPToken: zero address");
        pool = _pool;
    }

    /*//////////////////////////////////////////////////////////////
                               MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyPool() {
        require(msg.sender == pool, "LPToken: only pool");
        _;
    }

    /*//////////////////////////////////////////////////////////////
                              ERC20 LOGIC
    //////////////////////////////////////////////////////////////*/

    /// @notice Approve spender to transfer tokens
    /// @param spender Address to approve
    /// @param amount Amount to approve
    /// @return success Always true
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    /// @notice Transfer tokens to recipient
    /// @param to Recipient address
    /// @param amount Amount to transfer
    /// @return success Always true if successful
    function transfer(address to, uint256 amount) external returns (bool) {
        return _transfer(msg.sender, to, amount);
    }

    /// @notice Transfer tokens from sender to recipient
    /// @param from Sender address
    /// @param to Recipient address
    /// @param amount Amount to transfer
    /// @return success Always true if successful
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        
        // Save gas for infinite approvals
        if (allowed != type(uint256).max) {
            require(allowed >= amount, "LPToken: insufficient allowance");
            unchecked {
                allowance[from][msg.sender] = allowed - amount;
            }
        }

        return _transfer(from, to, amount);
    }

    /*//////////////////////////////////////////////////////////////
                            MINT/BURN LOGIC
    //////////////////////////////////////////////////////////////*/

    /// @notice Mint new LP tokens (only callable by pool)
    /// @param to Recipient address
    /// @param amount Amount to mint
    function mint(address to, uint256 amount) external onlyPool {
        require(to != address(0), "LPToken: mint to zero");
        
        totalSupply += amount;
        unchecked {
            balanceOf[to] += amount;
        }
        
        emit Transfer(address(0), to, amount);
    }

    /// @notice Burn LP tokens (only callable by pool)
    /// @param from Address to burn from
    /// @param amount Amount to burn
    function burn(address from, uint256 amount) external onlyPool {
        require(balanceOf[from] >= amount, "LPToken: insufficient balance");
        
        unchecked {
            balanceOf[from] -= amount;
        }
        totalSupply -= amount;
        
        emit Transfer(from, address(0), amount);
    }

    /*//////////////////////////////////////////////////////////////
                            INTERNAL LOGIC
    //////////////////////////////////////////////////////////////*/

    function _transfer(address from, address to, uint256 amount) internal returns (bool) {
        require(to != address(0), "LPToken: transfer to zero");
        require(balanceOf[from] >= amount, "LPToken: insufficient balance");

        unchecked {
            balanceOf[from] -= amount;
            balanceOf[to] += amount;
        }

        emit Transfer(from, to, amount);
        return true;
    }
}
