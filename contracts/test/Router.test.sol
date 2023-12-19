// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {PRBTest} from "@prb/test/PRBTest.sol";
import {StdCheats} from "forge-std/StdCheats.sol";
import {Router} from "../src/Router.sol";
import {MockToken} from "../src/mocks/MockToken.sol";
import {MockRegistry} from "../src/mocks/MockRegistry.sol";

contract RouterTest is PRBTest, StdCheats {
    address public constant USER1 = address(0x1);
    address public constant USER2 = address(0x2);
    address public constant USER3 = address(0x3);

    MockRegistry public immutable registry;
    MockToken public immutable token;
    MockToken public immutable numeraire;
    Router public immutable router;
    bytes32 public immutable poolId;

    constructor() {
        registry = new MockRegistry();
        router = new Router(address(registry));
        token = new MockToken();
        numeraire = new MockToken();
        poolId = router.getPoolId(address(token), address(numeraire));
        token.approve(address(router), type(uint256).max);
        numeraire.approve(address(router), type(uint256).max);
    }

    function setUp() public {
        vm.deal(USER1, 1 ether);
        vm.deal(USER2, 1 ether);
        vm.deal(USER3, 1 ether);
    }

    function testCreate() public {
        (address tkn,,,) = router.pools(poolId);
        assertEq(tkn, address(0));
        bytes32 id = router.create(address(token), address(numeraire));
        assertEq(id, poolId);
        (tkn,,,) = router.pools(poolId);
        assertNotEq(tkn, address(0));
        assertEq(registry.balanceOf(address(this)), 0);
        assertEq(registry.balanceOf(address(router)), 1);
    }

    function testCreateTwice() public {
        router.create(address(token), address(numeraire));
        vm.expectRevert();
        router.create(address(token), address(numeraire));
    }

    function testPoints() public {
        uint256 initialBalance = USER1.balance;

        assertEq(router.points(USER1), 0);
        vm.prank(USER1);
        router.create(address(token), address(numeraire));
        assertGte(router.points(USER1), 0);

        uint256 points = router.points(USER1);
        vm.deal(address(registry), points);

        vm.prank(USER1);
        router.withdrawPoints(points);

        assertGt(USER1.balance, initialBalance);
        assertEq(router.points(USER1), 0);
    }

    function testSwap(uint256 circulatingTokens, uint256 depositedTokens, uint256 numeraireBalance, uint256 swapAmount)
        public
    {
        vm.assume(depositedTokens < type(uint256).max - circulatingTokens);
        vm.assume(numeraireBalance <= type(uint256).max / 1e18);
        vm.assume(circulatingTokens + depositedTokens <= type(uint256).max - swapAmount);

        router.create(address(token), address(numeraire));
        _deposit(depositedTokens, numeraireBalance);
        if (circulatingTokens == 0) {
            assertEq(router.quoteTokenForNumeraire(poolId, swapAmount), 0);
        } else {
            assertAlmostEq(
                router.quoteTokenForNumeraire(poolId, swapAmount),
                swapAmount * numeraireBalance / circulatingTokens,
                1e3
            );
        }
    }

    function _deposit(uint256 tokenAmount, uint256 numeraireAmount) internal {
        token.mint(tokenAmount);
        router.deposit(poolId, address(token), tokenAmount);

        numeraire.mint(numeraireAmount);
        router.deposit(poolId, address(numeraire), numeraireAmount);
    }
}
