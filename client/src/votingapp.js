import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import VotingContract from './contracts/Voting.json'; // Correct import path for ABI

const VotingApp = () => {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const loadBlockchainData = async () => {
    const web3 = new Web3(Web3.givenProvider || "http://localhost:7545"); // Connect to Ganache
    const accounts = await web3.eth.requestAccounts();
    setAccount(accounts[0]);

    const networkId = await web3.eth.net.getId();
    const networkData = VotingContract.networks[networkId];

    if (networkData) {
      const votingInstance = new web3.eth.Contract(VotingContract.abi, networkData.address);
      setContract(votingInstance);

      // Fetch all candidates
      const candidatesList = await votingInstance.methods.getAllCandidates().call();
      const candidatesWithVotes = await Promise.all(
        candidatesList.map(async (name) => {
          const voteCount = await votingInstance.methods.totalVotesFor(name).call();
          return { name, voteCount };
        })
      );
      setCandidates(candidatesWithVotes);

      // Check if the user has already voted
      const hasUserVoted = await votingInstance.methods.hasVoted(accounts[0]).call();
      setVoted(hasUserVoted);
    } else {
      alert("Smart contract not deployed to detected network.");
    }
  };

  const vote = async (candidateName) => {
    try {
      await contract.methods.vote(candidateName).send({ from: account });
      setVoted(true);
      loadBlockchainData(); // Reload candidate data after voting
    } catch (error) {
      console.error("Voting failed:", error);
      alert("Voting failed!");
    }
  };

  return (
    <div>
      <h2>Decentralized Voting DApp</h2>
      <p>Account: {account}</p>
      <h3>Candidates</h3>
      <ul>
        {candidates.map((candidate, index) => (
          <li key={index}>
            {candidate.name} - {candidate.voteCount} votes
            <button onClick={() => vote(candidate.name)} disabled={voted}>
              {voted ? "Voted" : "Vote"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VotingApp;
