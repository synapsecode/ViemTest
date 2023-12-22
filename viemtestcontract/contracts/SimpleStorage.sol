// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    // State variable to store the value
    uint256 private storedValue;

    event ValueUpdated(uint256 newValue);
    event Deposit(address indexed depositor, uint256 amount);

    function get() public view returns (uint256) {
        return storedValue;
    }

    function set(uint256 newValue) public {
        storedValue = newValue;
        emit ValueUpdated(newValue);
    }

    function checkBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function deposit() public payable {
        emit Deposit(msg.sender, msg.value);
    }
}
