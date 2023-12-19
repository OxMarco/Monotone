// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IRegistry {
    function balances(uint256 _tokenId) external view returns (uint256);
    function register(address _recipient) external returns (uint256 tokenId);
    function withdraw(uint256 _tokenId, address payable _recipient, uint256 _amount) external returns (uint256);
}
