import React from 'react';
import BountyTile from './BountyTile';
import '../css/BountyTileList.css';
import { motion } from 'framer-motion';

export default function BountyTileList({ bountyList, bountyType, viewerType }) {
  return (
    <motion.div
      className="bounty-tile-list-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      {bountyList.map((bounty, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <BountyTile BountyDetails={bounty} bountyType={bountyType} viewerType={viewerType} />
        </motion.div>
      ))}
    </motion.div>
  );
}