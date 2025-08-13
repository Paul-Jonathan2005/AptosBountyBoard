import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import "../css/FreelancerDashboard.css"
import { fetchDashboardDetails } from '../services/api';
import { motion } from 'framer-motion';

export default function FreelancerDashboard() {
  const [freelanceDashboardDetails, setFreelancerDashboardDetails] = useState({});
  useEffect(() => {
    const getDashboardDetails = async () => {
      try {
        const data = await fetchDashboardDetails("freelancer");
        setFreelancerDashboardDetails(data);
      } catch (error) {
        console.error('Failed to fetch Details:', error);
      }
    };
    getDashboardDetails();
  }, []);
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title h" >Freelancer Dashboard</h1>
      <motion.div
        className="dashboard-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="dashboard-tile tile-green-1"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <h3>Earned Rewards</h3>
          <div className="reward-container">
            <div className="reward-value">{freelanceDashboardDetails.earned_task_reward ? freelanceDashboardDetails.earned_task_reward.toFixed(2) : "0.00"}</div>
            <div className="reward-unit">APTOS</div>
          </div>
        </motion.div>
        <motion.div
          className="dashboard-tile tile-blue-1"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <h3>Active Bounties</h3>
          <p>{freelanceDashboardDetails.active_bounties_count}</p>
        </motion.div>
        <motion.div
          className="dashboard-tile tile-green-2"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <h3>Completed</h3>
          <p>{freelanceDashboardDetails.completed_bounties_count}</p>
        </motion.div>
        <motion.div
          className="dashboard-tile tile-orange-1"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <h3>Payment Pending</h3>
          <p>{freelanceDashboardDetails.payment_pending_bounties_count}</p>
        </motion.div>
        <motion.div
          className="dashboard-tile tile-red-1"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <h3>Disputed</h3>
          <p>{freelanceDashboardDetails.disputed_bounties_count}</p>
        </motion.div>
        <motion.div
          className="dashboard-tile tile-purple-1"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <h3>Requested Bounties</h3>
          <p>{freelanceDashboardDetails.requested_bounties_count}</p>
        </motion.div>
      </motion.div>
    </div>
  );
}