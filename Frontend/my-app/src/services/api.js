import axios from 'axios';
import env_config from '../Config.js';

import { AptosClient } from "aptos";

const aptosClient = new AptosClient("https://fullnode.testnet.aptoslabs.com");
const MODULE_ADDRESS = "7e6213fecd8feee9d3908368eb43825af78f6116ab922f5544574cd13272b4f8";

// Helper to normalize Aptos address to 0x-prefixed string and validate as hex
const normalizeAddress = (addr) => {
  if (addr === null || addr === undefined || addr === "") {
    throw new Error("Wallet address is missing. Please connect your wallet.");
  }
  if (typeof addr !== "string") addr = String(addr);
  if (!addr.startsWith("0x")) addr = "0x" + addr;
  const hex = addr.slice(2);
  if (!/^[0-9a-fA-F]+$/.test(hex)) {
    throw new Error(`Invalid Aptos address: ${addr}`);
  }
  return addr;
};

const API = axios.create({
  baseURL: '/api', 
});

export const registerUser = async (userData) => {
  userData = {
    ...userData,
    rating: 0,
    num_of_rating : 0
  }
  const response = await API.post('register/', userData);
  return response.data;
};

export const postFinalSubmissionLink = async (finalSubmission, bountyId) => {
  const token = localStorage.getItem('authToken');
  const response = await API.post(`accept-submission-link/${bountyId}`, finalSubmission, {
    headers: {
      Authorization: `Token ${token}`
    }
  });
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await API.post('login/', userData);
  const user_id = response.data.user_id
  const user_role = response.data.user_role
  const token = response.data.token;
  if (token) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('username', userData.username);
    localStorage.setItem('userId', user_id);
    localStorage.setItem('userRole', user_role);
  }
  return response.data;
};

export const logoutUser = async () => {
  const token = localStorage.getItem('authToken');
  const response = await API.post('logout/', {}, {
    headers: {
      Authorization: `Token ${token}`
    }
  });
  if (response.status === 200) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletInfo');
    localStorage.removeItem('walletInfo');
  }
  return response.data;
};

export const fetchUserDetails = async () => {
  const username = localStorage.getItem('username');
  const token = localStorage.getItem('authToken');
  const response = await API.get(`get-user-details/${username}`, {
    headers: {
      Authorization: `Token ${token}`
    }
  });
  return response.data.user_details;
};

export const fetchBountyDetails = async (bountyId) => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('authToken');
  const response = await API.get(`get-bounty-details/${bountyId}/${userId}`, {
    headers: {
      Authorization: `Token ${token}`
    }
  });
  return response.data.bounty_details;
};


export const fetchBountyList = async (bountyType) => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('authToken');
  const response = await API.get(`get-client-bounties/${userId}/${bountyType}`, {
    headers: {
      Authorization: `Token ${token}`
    }
  });
  return response.data.client_bounties;
}; 

export const fetchDashboardDetails = async (userType) => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('authToken');
  const response = await API.get(`get-dashboard-details/${userType}/${userId}`, {
    headers: {
      Authorization: `Token ${token}`
    }
  });
  console.log(response)
  return response.data.dashboard_details;
}; 


export const transferAmount = async ( isFreelancer ,bountyId) => {
  const token = localStorage.getItem('authToken');
  const response = await API.get(`transfer-amount/${isFreelancer}/${bountyId}`, {
    headers: {
      Authorization: `Token ${token}`
    }
  });
  return response;
}; 

export const transferDirectlyAmount = async ( bountyId) => {
  const token = localStorage.getItem('authToken');
  const response = await API.get(`transfer-directly-amount/${bountyId}`, {
    headers: {
      Authorization: `Token ${token}`
    }
  });
  return response;
}; 

export const fetchFreelancerBountyList = async (bountyType) => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('authToken');
  const response = await API.get(`get-freelancer-bounties/${userId}/${bountyType}`, {
    headers: {
      Authorization: `Token ${token}`
    }
  });
  return response.data.freelancer_bounties;
}; 

export const fetchClientBountyList = async (bountyType) => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('authToken');
  const response = await API.get(`get-client-bounties/${userId}/${bountyType}`, {
    headers: {
      Authorization: `Token ${token}`
    }
  });
  return response.data.client_bounties;
}; 

export const deleteVote = async (bountyId) => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('authToken');
  const response = await API.delete(`vote-delete/${bountyId}/${userId}`, {
    headers: {
      Authorization: `Token ${token}`
    }
  });
  return response.data;
}; 

export const fetchFreelancerBounties = async () => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('authToken');
  const response = await API.get(`get-requested-bounties/${userId}`, {
    headers: {
      Authorization: `Token ${token}`
    }
  });
  return response.data.requestedBounties;
}; 

export const fetchDisputedBounties = async () => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('authToken');
  const response = await API.get(`get-disputed-bounties/${userId}`, {
    headers: {
      Authorization: `Token ${token}`
    }
  });
  return response.data.disputed_bounties;
}; 

export const fetchRewardBounties = async () => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('authToken');
  const response = await API.get(`get-reward-bounties/${userId}`, {
    headers: {
      Authorization: `Token ${token}`
    }
  });
  return response.data.reward_bounties;
}; 

export const fetchBountyTypes = async () => {
  const token = localStorage.getItem('authToken');
  const response = await API.get('get-bounty-types/', {
    headers: {
      Authorization: `Token ${token}`
    }
  });
  return response.data.task_types;
}; 

export const fecthTaskTypeBounties = async (taskType) => {
  const token = localStorage.getItem('authToken');
  const response = await API.get(`get-bounty-types/${taskType}/get-bounties`, {
    headers: {
      Authorization: `Token ${token}`
    }
  });
  return response.data.bounties;
}; 

export const fetchBountyRequests = async (bountyId) => {
  const token = localStorage.getItem('authToken');
  const response = await API.get(`get-client-bounty/${bountyId}/get-requests`, {
    headers: {
      Authorization: `Token ${token}`
    }
  });
  return response.data.requested_candidates;
}; 

export const raiseDispute = async (bountyId) => {
  const token = localStorage.getItem('authToken');
  const response = await API.get(`raise-dispute/${bountyId}`, {
    headers: {
      Authorization: `Token ${token}`
    }
  });
  return response.data;
}; 

export const fetchMessages = async (bountyId) => {
  const token = localStorage.getItem('authToken');
  const response = await API.get(`message/${bountyId}`, {
    headers: {
      Authorization: `Token ${token}`
    }
  });
  return response.data.chat;
}; 

export const fetchComplaints = async (bountyId) => {
  const token = localStorage.getItem('authToken');
  const response = await API.get(`complaint/${bountyId}`, {
    headers: {
      Authorization: `Token ${token}`
    }
  });
  return response.data.complaint;
}; 

export const postChatMessage = async (formData, bountyId) => {
  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId');
  const payLoad = {
    bounty_id: bountyId,
    user: userId,
    message: formData.chat,
    created_time: new Date().toISOString(),
  }
  const response = await API.post(`message/`, payLoad, {
    headers: {
      Authorization: `Token ${token}`
    }

  });
  return response.data;
}; 

export const postComplaintMessage = async (complaintData, bountyId) => {
  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId');
  const payLoad = {
    bounty_id: bountyId,
    user: userId,
    message: complaintData.complaint,
    created_time: new Date().toISOString(),
  }
  const response = await API.post(`complaint/`, payLoad, {
    headers: {
      Authorization: `Token ${token}`
    }

  });
  return response.data;
}; 


export const createBounty = async (bountyData) => {
  const userId = localStorage.getItem('userId');
  bountyData = {
    ...bountyData,
    client_id: userId,
  }
  const token = localStorage.getItem('authToken');
  const response = await API.post('create-bounty/', bountyData, {
    headers: {
      Authorization: `Token ${token}`
    }
  });
  return response.data;
}; 

export const sendBountyRequest = async (bountyId) => {
  const freelancerAddress = localStorage.getItem("walletAddress");
  const userId = localStorage.getItem('userId');
  const requestData = {
    requested_candidate_id: userId,
    bounty_id: bountyId,
    candidate_pera_wallet_address: freelancerAddress,
  }
  const token = localStorage.getItem('authToken');
  const response = await API.post('request-bounty/', requestData, {
    headers: {
      Authorization: `Token ${token}`
    }
  });
  return response.data;
}; 

export const sendVote = async (bountyId, voted_for) => {
  const userId = localStorage.getItem('userId');
  const requestData = {
    user: userId,
    bounty_id: bountyId,
    voted_for: voted_for
  }
  const token = localStorage.getItem('authToken');
  const response = await API.post('voting/', requestData, {
    headers: {
      Authorization: `Token ${token}`
    }
  });
  return response.data;
}; 

export const acceptBountyRequest = async (bountyId, candidateId) => {
  const token = localStorage.getItem('authToken');
  const response = await API.post('accept-bounty-request/', {
    bounty_id: bountyId,
    requested_candidate_id: candidateId,
  }, {
    headers: {
      Authorization: `Token ${token}`,
    }
  });

  return response.data;
};

export const transferAlgosToSmartContracts = async (
  bountyId,
  rewardAmount,
  freelancerAddress,
  activeAddress
) => {
  try {
    // Auto-connect wallet if activeAddress is missing
    if (!activeAddress) {
      const connectResponse = await window.aptos.connect();
      activeAddress = connectResponse.address;
      localStorage.setItem("walletAddress", activeAddress);
    }
    // Check freelancer address as well
    if (!freelancerAddress) {
      throw new Error("Freelancer wallet address is missing.");
    }
    // Convert reward to octas (assume rewardAmount is in APT)
    const rewardInOctas = BigInt(rewardAmount) * 100000000n;
    // Add some extra amount for smart contract fees
    const extraAmount = 10000000n;
    const totalAmount = rewardInOctas + extraAmount;
    const payload = {
      type: "entry_function_payload",
      function: `${MODULE_ADDRESS}::task_bounty::create_task`,
      type_arguments: [],
      arguments: [
        String(bountyId),
        normalizeAddress(activeAddress),     // company address
        normalizeAddress(freelancerAddress), // freelancer address
        String(rewardInOctas)
      ],
    };
    const txHash = await window.aptos.signAndSubmitTransaction(payload);
    await aptosClient.waitForTransaction(txHash.hash);
    return txHash;
  } catch (error) {
    console.error("Error in transferAlgosToSmartContracts:", error);
    throw error;
  }
};

export const transferAlgosToFreelancer = async (
  bountyId,
  activeAddress
) => {
  try {
    if (!activeAddress) {
      const connectResponse = await window.aptos.connect();
      activeAddress = connectResponse.address;
      localStorage.setItem("walletAddress", activeAddress);
    }
    const payload = {
      type: "entry_function_payload",
      function: `${MODULE_ADDRESS}::task_bounty::release_reward`,
      type_arguments: [],
      arguments: [
        String(bountyId)
      ],
    };
    const txHash = await window.aptos.signAndSubmitTransaction(payload);
    await aptosClient.waitForTransaction(txHash.hash);
    return txHash;
  } catch (error) {
    console.error("Error in transferAlgosToFreelancer:", error);
    throw error;
  }
};


export const startDisputeSmartContract = async (
  bountyId,
  activeAddress
) => {
  try {
    if (!activeAddress) {
      const connectResponse = await window.aptos.connect();
      activeAddress = connectResponse.address;
      localStorage.setItem("walletAddress", activeAddress);
    }
    const payload = {
      type: "entry_function_payload",
      function: `${MODULE_ADDRESS}::task_bounty::start_appeal`,
      type_arguments: [],
      arguments: [
        String(bountyId)
      ],
    };
    const txHash = await window.aptos.signAndSubmitTransaction(payload);
    await aptosClient.waitForTransaction(txHash.hash);
    return txHash;
  } catch (error) {
    console.error("Error in startDisputeSmartContract:", error);
    throw error;
  }
};

export const votingSmartContract = async(
  bountyId,
  voted_for,
  activeAddress
) => {
  try {
    if (!activeAddress) {
      const connectResponse = await window.aptos.connect();
      activeAddress = connectResponse.address;
      localStorage.setItem("walletAddress", activeAddress);
    }
    // voted_for: expects "FREELANCER" or "CLIENT", convert to boolean
    const vote_for_freelancer = voted_for === "FREELANCER";
    const payload = {
      type: "entry_function_payload",
      function: `${MODULE_ADDRESS}::task_bounty::cast_vote`,
      type_arguments: [],
      arguments: [
        String(bountyId),
        vote_for_freelancer
      ],
    };
    const txHash = await window.aptos.signAndSubmitTransaction(payload);
    await aptosClient.waitForTransaction(txHash.hash);
    return txHash;
  } catch (error) {
    console.error("Error in votingSmartContract:", error);
    throw error;
  }
};

export const claimRewardSmartContract = async (bountyId, activeAddress) => {
  try {
    // Connect wallet if not connected
    if (!activeAddress) {
      const connectResponse = await window.aptos.connect();
      activeAddress = connectResponse.address;
      localStorage.setItem("walletAddress", activeAddress);
    }

    const payload = {
      type: "entry_function_payload",
      function: `${MODULE_ADDRESS}::task_bounty::resolve_dispute`,
      type_arguments: [],
      arguments: [String(bountyId)], // bounty/task ID as string
    };

    // Sign and submit transaction using Petra wallet
    const txHash = await window.aptos.signAndSubmitTransaction(payload);

    // Wait for transaction to be confirmed on-chain
    await aptosClient.waitForTransaction(txHash.hash);

    return txHash;
  } catch (error) {
    console.error("Error in claimRewardSmartContract:", error);
    throw error;
  }
};

export const voterClaimRewardSmartContract = async(
  bountyId,
  activeAddress
) => {
  try {
    if (!activeAddress) {
      const connectResponse = await window.aptos.connect();
      activeAddress = connectResponse.address;
      localStorage.setItem("walletAddress", activeAddress);
    }
    const payload = {
      type: "entry_function_payload",
      function: `${MODULE_ADDRESS}::task_bounty::claim_voting_reward`,
      type_arguments: [],
      arguments: [
        String(bountyId)
      ],
    };
    const txHash = await window.aptos.signAndSubmitTransaction(payload);
    await aptosClient.waitForTransaction(txHash.hash);
    return txHash;
  } catch (error) {
    console.error("Error in voterClaimRewardSmartContract:", error);
    throw error;
  }
};
// Initialize the task store in the Move module for a given address
export const initializeTaskStore = async (activeAddress) => {
  try {
    // Connect the wallet if address is missing
    if (!activeAddress) {
      const connectResponse = await window.aptos.connect();
      activeAddress = connectResponse.address;
      localStorage.setItem("walletAddress", activeAddress);
    }
    const payload = {
      type: "entry_function_payload",
      function: `${MODULE_ADDRESS}::task_bounty::init`,
      type_arguments: [],
      arguments: [],
    };
    const txHash = await window.aptos.signAndSubmitTransaction(payload);
    await aptosClient.waitForTransaction(txHash.hash);
    console.log("Task store initialized successfully:", txHash.hash);
    return txHash.hash;
  } catch (error) {
    console.error("Error in initializeTaskStore:", error);
    throw error;
  }
};

export const resourceExists = async (address) => {
  try {
    const resourceType = `0x${MODULE_ADDRESS}::task_bounty::TaskStore`;
    const encodedResourceType = encodeURIComponent(resourceType);

    const response = await fetch(
      `https://fullnode.testnet.aptoslabs.com/v1/accounts/${address}/resource/${encodedResourceType}`
    );

    if (response.ok) return true;
    if (response.status === 404) return false;

    console.warn(`Unexpected status fetching resource: ${response.status}`);
    return false;
  } catch (e) {
    console.error("Error fetching resource:", e);
    return false;
  }
};