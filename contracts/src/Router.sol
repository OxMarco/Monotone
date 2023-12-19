// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IRegistry} from "./interfaces/IRegistry.sol";

contract Router is IERC721Receiver {
    using SafeERC20 for IERC20;

    struct Pool {
        address token;
        address numeraire;
        uint256 tokenBalance;
        uint256 numeraireBalance;
    }

    uint256 public constant RESOLUTION = 1e18;
    IRegistry public immutable registry;
    uint256 public id;
    mapping(bytes32 id => Pool pool) public pools;
    mapping(address user => uint256 balance) public points;

    event PoolCreated(bytes32 indexed poolId, address indexed token, address indexed numeraire);
    event NewDeposit(bytes32 indexed poolId, address indexed tkn, uint256 amount);
    event NewSwap(bytes32 indexed poolId, address indexed from, address indexed to, uint256 amountIn, uint256 obtained);
    event PointsAccrued(address indexed user, uint256 amount);
    event PointsWithdrawn(address indexed user, uint256 amount);

    error InvalidParams();
    error InvalidSwap();
    error PoolAlreadyExists();
    error PoolNotFound();
    error Slippage();
    error InsufficientPoints();
    error InsufficientBalance();

    constructor(address _registry) {
        registry = IRegistry(_registry);
        id = registry.register(address(this));
    }

    fallback() external payable {}

    receive() external payable {}

    modifier exists(bytes32 poolId) {
        if (pools[poolId].token == address(0)) revert PoolNotFound();
        _;
    }

    modifier accruePoints() {
        uint256 initial = gasleft();
        _;
        points[msg.sender] += initial - gasleft();

        emit PointsAccrued(msg.sender, points[msg.sender]);
    }

    function getPoolId(address token, address numeraire) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(token, numeraire));
    }

    function withdrawPoints(uint256 amount) external {
        if (amount > points[msg.sender]) revert InsufficientPoints();
        if (amount > registry.balances(id)) revert InsufficientBalance();

        points[msg.sender] -= amount;
        registry.withdraw(id, payable(msg.sender), amount);

        emit PointsWithdrawn(msg.sender, amount);
    }

    function onERC721Received(
        address,
        /*operator*/
        address,
        /*from*/
        uint256,
        /*tokenId*/
        bytes calldata /*data*/
    ) external returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function create(address token, address numeraire) external accruePoints returns (bytes32) {
        bytes32 poolId = keccak256(abi.encodePacked(token, numeraire));
        if (pools[poolId].token != address(0)) revert PoolAlreadyExists();

        pools[poolId] = Pool(token, numeraire, 0, 0);

        emit PoolCreated(poolId, token, numeraire);

        return poolId;
    }

    function redeem(bytes32 poolId, uint256 amount, uint256 minOut) external accruePoints exists(poolId) {
        uint256 obtained = quoteTokenForNumeraire(poolId, amount);
        if (obtained < minOut) revert Slippage();

        Pool storage pool = pools[poolId];
        if (amount > pool.numeraireBalance) revert InvalidSwap();
        pool.numeraireBalance -= obtained;
        pool.tokenBalance += amount;
        IERC20(pool.token).safeTransferFrom(msg.sender, address(this), amount);
        IERC20(pool.numeraire).safeTransfer(msg.sender, obtained);

        emit NewSwap(getPoolId(pool.token, pool.numeraire), pool.token, pool.numeraire, amount, obtained);
    }

    function deposit(bytes32 poolId, address tkn, uint256 amount) external exists(poolId) {
        Pool storage pool = pools[poolId];
        IERC20(tkn).safeTransferFrom(msg.sender, address(this), amount);

        if (tkn == pool.token) {
            pool.tokenBalance += amount;
        } else if (tkn == pool.numeraire) {
            pool.numeraireBalance += amount;
        } else {
            revert InvalidParams();
        }

        emit NewDeposit(poolId, tkn, amount);
    }

    function quoteTokenForNumeraire(bytes32 poolId, uint256 tokenAmount) public view exists(poolId) returns (uint256) {
        Pool memory pool = pools[poolId];

        uint256 numeraireBalance = pool.numeraireBalance;
        uint256 tokenBalance = pool.tokenBalance;
        uint256 tokenTotalSupply = IERC20(pool.token).totalSupply();

        if (tokenTotalSupply == tokenBalance) return 0;

        // To maintain precision, we multiply by a large constant
        // then perform the division
        uint256 price = (numeraireBalance * RESOLUTION) / (tokenTotalSupply - tokenBalance) / RESOLUTION;
        uint256 numeraireAmount = tokenAmount * price;

        return numeraireAmount;
    }
}
