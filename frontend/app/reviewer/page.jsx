'use client'
import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Layout from '../../components/Layout'
import ReviewerFeedback from '../../components/Reviewer/ReviewerFeedback'

const Reviewer = () => {

  const [selectedNavItem, setSelectedNavItem] = useState(null);
  const { data: session, status } = useSession();

  if (!session) {
    return null;
  }

  const handleNavItemClick = (selectedItem) => {
    setSelectedNavItem(selectedItem);
  };

  const selectContainer = (selectedNavItem) => {

    switch (selectedNavItem) {
      // case 'Home':
      //   return <div>This is Home</div>
      //   break;
      case 'Feedback':
        return <ReviewerFeedback />
        break;
    }
  }

  return (
    <Layout type={'reviewer'} handleNavItemClick={handleNavItemClick} selectedNavItem={selectedNavItem}>
      {selectContainer(selectedNavItem)}
    </Layout>
  )
}

export default Reviewer