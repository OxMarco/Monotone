// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IRegistry} from "../interfaces/IRegistry.sol";

contract MockRegistry is IRegistry, ERC721 {
    uint256 public constant RESOLUTION = 1e18;
    uint256 public id;

    error NotOwner();

    constructor() ERC721("MockRegistry", "MOCKREGISTRY") {}

    receive() external payable {}

    function register(address _recipient) external returns (uint256 tokenId) {
        id++;
        _mint(_recipient, id);
        return id;
    }

    function withdraw(uint256 tokenId, address payable recipient, uint256 amount) external returns (uint256) {
        if (ownerOf(tokenId) != msg.sender) revert NotOwner();

        (bool success,) = recipient.call{value: amount}("");
        assert(success);

        return amount;
    }

    function balances(uint256 /*tokenId*/ ) external view override returns (uint256) {
        return address(this).balance;
    }
}
