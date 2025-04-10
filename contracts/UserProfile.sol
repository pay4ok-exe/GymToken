// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract UserProfile is Ownable {
    struct User {
        string username;
        string email;
        address userAddress;
        bool exists;
    }
    
    // Mapping from address to user profile
    mapping(address => User) private users;
    
    // Event emitted when a new user is registered
    event UserRegistered(address indexed userAddress, string username, string email);
    
    // Register a new user
    function registerUser(string memory _username, string memory _email) public {
        require(!users[msg.sender].exists, "User already registered");
        
        users[msg.sender] = User({
            username: _username,
            email: _email,
            userAddress: msg.sender,
            exists: true
        });
        
        emit UserRegistered(msg.sender, _username, _email);
    }
    
    // Get user information by address
    function getUserByAddress(address _userAddress) public view returns (
        string memory username,
        string memory email,
        address userAddress,
        bool exists
    ) {
        User memory user = users[_userAddress];
        return (user.username, user.email, user.userAddress, user.exists);
    }
    
    // Check if a user exists
    function userExists(address _userAddress) public view returns (bool) {
        return users[_userAddress].exists;
    }
}