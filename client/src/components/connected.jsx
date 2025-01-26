import React from "react";

const Connected = (props) => {
    console.log("Remaining Time:", props.remainingTime);
    console.log("Can Vote:", props.canVote);
    console.log("Candidates:", props.candidates);
    console.log("Selected Candidate:", props.candidateName);

    return (
        <div className="connected-container">
            <h1 className="connected-header">You are Connected to MetaMask</h1>
            <p className="connected-account">Remaining Time: {props.remainingTime} seconds</p>
            
            {!props.canVote ? (
                <p className="connected-account">You have already voted</p>
            ) : (
                <div>
                    {/* Dropdown to select a candidate */}
                    <select
                        value={props.candidateName}
                        onChange={props.handleCandidateChange}
                        style={{ display: 'block' }}
                    >
                        <option value="">Select a Candidate</option>
                        {props.candidates.map((candidate, index) => (
                            <option key={index} value={candidate.name}>
                                {candidate.name}
                            </option>
                        ))}
                    </select>

                    <br />
                    <button 
                        className="login-button" 
                        onClick={props.voteFunction} 
                        disabled={props.loading || !props.candidateName} 
                        style={{ display: 'block' }}
                    >
                        {props.loading ? 'Voting...' : 'Vote'}
                    </button>
                </div>
            )}

            {/* Display the list of candidates and votes */}
            <table className="candidates-table">
                <thead>
                    <tr>
                        <th>Index</th>
                        <th>Candidate Name</th>
                        <th>Votes</th>
                    </tr>
                </thead>
                <tbody>
                    {props.candidates.map((candidate, index) => (
                        <tr key={index}>
                            <td>{candidate.index}</td>
                            <td>{candidate.name}</td>
                            <td>{candidate.voteCount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Connected;
