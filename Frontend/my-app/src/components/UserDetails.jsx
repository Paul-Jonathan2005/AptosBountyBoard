import React, { useEffect, useState } from 'react';
import { fetchUserDetails, initializeTaskStore, resourceExists } from '../services/api'; 
import '../css/UserDetails.css';

export default function UserDetails() {
  const [userData, setUserData] = useState(null);
  const [walletInfo, setWalletInfo] = useState(null);

  useEffect(() => {
    const storedWalletInfo = localStorage.getItem('walletInfo');
    if (storedWalletInfo) {
      try {
        const parsed = JSON.parse(storedWalletInfo);
        setWalletInfo(parsed);
      } catch (e) {
        console.error("Failed to parse walletInfo from localStorage:", e);
      }
    }

    const loadUserDetails = async () => {
      try {
        const data = await fetchUserDetails();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    loadUserDetails();
  }, []);

  useEffect(() => {
    const refreshBalance = async () => {
      if (walletInfo?.address) {
        try {
          const response = await fetch(`https://fullnode.testnet.aptoslabs.com/v1/accounts/${walletInfo.address}/balance/0x1::aptos_coin::AptosCoin`);
          const data = await response.json();
          let balance = Number(data ?? 0);
          if (isNaN(balance)) {
            console.error("Invalid balance received:", data);
            setWalletInfo((prev) => ({
              ...prev,
              balance: 0
            }));
          } else {
            balance = balance / 1e8;
            setWalletInfo((prev) => ({
              ...prev,
              balance
            }));
          }
        } catch (error) {
          console.error("Failed to refresh balance:", error);
        }
      }
    };

    refreshBalance();
  }, [walletInfo?.address]);

  const handleWalletConnect = async () => {
    if (!window.aptos) {
      alert("Petra wallet extension not detected. Please install and enable it.");
      return;
    }
    try {
      await window.aptos.connect();
      const account = await window.aptos.account();
      const address = account.address;

      const exists = await resourceExists(address);
      if (!exists) {
        try {
          await initializeTaskStore(address);
          console.log("TaskStore initialized successfully");
        } catch (initError) {
          console.warn("TaskStore initialization error (might already be initialized):", initError);
        }
      } else {
        console.log("TaskStore resource already exists for this address.");
      }

      const response = await fetch(`https://fullnode.testnet.aptoslabs.com/v1/accounts/${address}/balance/0x1::aptos_coin::AptosCoin`);
      const data = await response.json();
      let balance = Number(data ?? 0);
      if (isNaN(balance)) {
        console.error("Invalid balance received:", data);
      }
      balance = balance / 1e8;
      const value = { address, balance: isNaN(balance) ? 0 : balance };
      setWalletInfo(value);
      localStorage.setItem('walletAddress', address);
      localStorage.setItem('walletInfo', JSON.stringify(value));
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  }

  const handleWalletDisconnect = async () => {
    try {
      await window.aptos.disconnect();
      setWalletInfo(null);
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('walletInfo');
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
    }
  }

  return (
    <div className="user-page-layout">
      <div className="user-details-container">
        <h2 className="user-details-title">User Details</h2>
        {userData ? (
          <div className="user-details-list">
            <div className="user-details-label">First Name:</div>
            <div className="user-details-value">{userData.first_name}</div>

            <div className="user-details-label">Last Name:</div>
            <div className="user-details-value">{userData.last_name}</div>

            <div className="user-details-label">Rating:</div>
            <div className="user-details-value rating-stars">
              {[...Array(5)].map((_, i) => {
                const fill = Math.min(Math.max(userData.rating - i, 0), 1);
                return (
                  <span
                    key={i}
                    className="star"
                    style={{ '--fill': `${fill * 100}%` }}
                  >
                    ★
                  </span>
                );
              })}
            </div>

            <div className="user-details-label">LinkedIn:</div>
            <div className="user-details-value">
              <a href={userData.linkedin_profile_link} target="_blank" rel="noopener noreferrer">
                View Profile
              </a>
            </div>
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </div>
      <div className="pera-wallet-container">
        {!walletInfo && (
          <button
            className="connect-pera-button"
            onClick={handleWalletConnect}
          >
            Connect to Petra Wallet
          </button>
        )}
        {walletInfo && (
          <div className="wallet-details">
            <div className="wallet-top-section">
              <p className="wallet-balance">{walletInfo.balance ?? 0}</p>
            </div>
            <p className="wallet-address">{walletInfo.address}</p>
            <div className="wallet-bottom-section">
              <button onClick={handleWalletDisconnect} className="disconnect-wallet-button">
                Disconnect Petra Wallet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}