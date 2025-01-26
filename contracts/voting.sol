// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    address public owner;
    mapping(address => bool) public hasVoted;
    mapping(string => uint) public votesReceived;
    string[] public candidateList;

    event Debug(string message);
    event Voted(string candidate, address voter);

    constructor(string[] memory candidateNames) {
        emit Debug("Constructor started");

        require(candidateNames.length > 0, "Candidate list must not be empty.");
        emit Debug("Candidate list is not empty");

        owner = msg.sender;
        emit Debug("Owner is set");

        for (uint i = 0; i < candidateNames.length; i++) {
            candidateList.push(candidateNames[i]);
            votesReceived[candidateNames[i]] = 0;
            emit Debug(string(abi.encodePacked("Added candidate: ", candidateNames[i])));
        }

        emit Debug("Constructor finished");
    }

    // Function to vote for a candidate
    function vote(string memory candidate) public {
        require(!hasVoted[msg.sender], "You have already voted.");
        require(validCandidate(candidate), "Candidate does not exist.");

        votesReceived[candidate] += 1;
        hasVoted[msg.sender] = true;

        emit Voted(candidate, msg.sender);
    }

    // Helper function to check if a candidate is valid
    function validCandidate(string memory candidate) public view returns (bool) {
        for (uint i = 0; i < candidateList.length; i++) {
            if (keccak256(abi.encodePacked(candidateList[i])) == keccak256(abi.encodePacked(candidate))) {
                return true;
            }
        }
        return false;
    }

    // Function to get total votes for a candidate
    function totalVotesFor(string memory candidate) public view returns (uint) {
        require(validCandidate(candidate), "Candidate does not exist.");
        return votesReceived[candidate];
    }

    // Function to get all candidates (useful for front-end display)
    function getAllCandidates() public view returns (string[] memory) {
        return candidateList;
    }
}
