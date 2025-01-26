import { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { contractAbi, contractAddress } from './constant/constant';
import Login from './components/login';
import Connected from './components/connected';
import './App.css';

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [candidateName, setCandidateName] = useState(''); // Track selected candidate
  const [canVote, setCanVote] = useState(true);
  const [loading, setLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    if (provider && account && isConnected) {
      getCandidates(); // Fetch candidates when user connects
      checkCanVote();  // Check if the user has already voted
    }

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [provider, account, isConnected]);

  // Handle the voting process
  async function vote() {
    try {
      setLoading(true); // Indicate loading while transaction is pending
      const signer = await provider.getSigner();
      const contractInstance = new Contract(contractAddress, contractAbi, signer);

      // Validate candidate name before voting
      const isValid = await contractInstance.validCandidate(candidateName);
      if (!isValid) {
        alert('Invalid candidate. Please select a valid candidate.');
        return;
      }

      const tx = await contractInstance.vote(candidateName);
      await tx.wait(); // Wait for transaction to complete
      checkCanVote(); // Re-check if the user can vote
      getCandidates(); // Refresh the candidate list after voting
    } catch (error) {
      console.error('Error while voting:', error);
      alert('Voting failed! ' + (error.data?.message || ''));
    } finally {
      setLoading(false); // Stop loading indication
    }
  }

  // Check if the user has voted
  async function checkCanVote() {
    try {
      if (!provider) return;
      const signer = await provider.getSigner();
      const contractInstance = new Contract(contractAddress, contractAbi, signer);
      const hasVoted = await contractInstance.hasVoted(await signer.getAddress());
      setCanVote(!hasVoted); // If the user has voted, they cannot vote again
    } catch (error) {
      console.error('Error while checking vote status:', error);
    }
  }

  // Get the list of candidates and their vote counts
  async function getCandidates() {
    try {
      if (!provider) return;
      const signer = await provider.getSigner();
      const contractInstance = new Contract(contractAddress, contractAbi, signer);
      const candidatesList = await contractInstance.getAllCandidates();

      const formattedCandidates = await Promise.all(
        candidatesList.map(async (candidate, index) => {
          const voteCount = await contractInstance.totalVotesFor(candidate);
          return {
            index: index,
            name: candidate,
            voteCount: voteCount.toString(), // Ensure proper formatting
          };
        })
      );

      setCandidates(formattedCandidates);
    } catch (error) {
      console.error('Error while fetching candidates:', error);
    }
  }

  function handleAccountsChanged(accounts) {
    if (accounts.length > 0 && account !== accounts[0]) {
      setAccount(accounts[0]);
      checkCanVote();
    } else {
      setIsConnected(false);
      setAccount(null);
    }
  }

  // Connect to MetaMask
  async function connectToMetamask() {
    if (!window.ethereum) {
      alert('MetaMask is not installed. Please install MetaMask and refresh the page.');
      return;
    }

    try {
      const newProvider = new BrowserProvider(window.ethereum);
      await newProvider.send('eth_requestAccounts', []);
      const signer = await newProvider.getSigner();
      setProvider(newProvider);
      const address = await signer.getAddress();
      setAccount(address);
      setIsConnected(true);
      checkCanVote();
    } catch (err) {
      console.error('Error connecting to MetaMask:', err);
    }
  }

  // Update candidate name as input changes
  function handleCandidateChange(e) {
    setCandidateName(e.target.value); // Controlled input for candidate name
  }

  return (
    <div className="App">
      {isConnected ? (
        <Connected
          account={account}
          candidates={candidates}
          candidateName={candidateName}
          remainingTime={remainingTime}
          handleCandidateChange={handleCandidateChange}
          voteFunction={vote}
          canVote={canVote} // Pass canVote to disable voting if user already voted
          loading={loading} // Disable button while loading
        />
      ) : (
        <Login connectWallet={connectToMetamask} />
      )}
    </div>
  );
}

export default App;
