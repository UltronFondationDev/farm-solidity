// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

interface IwULX {
    function mint(address account, uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}
