'use client'
import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Layout from '../../components/Layout'
import AuthorSubmission from '../../components/Author/AuthorSubmission'
import AuthorFeedback from '../../components/Author/AuthorFeedback'

const Author = () => {

  const { data: session, status } = useSession();
  const [selectedNavItem, setSelectedNavItem] = useState(null);

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
      case 'Submissions':
        return <AuthorSubmission />
        break;
      case 'Feedbacks':
        return <AuthorFeedback />
        break;
      default:
        break;
    }
  }

  return (
    <Layout type={'author'} handleNavItemClick={handleNavItemClick} selectedNavItem={selectedNavItem}> 
      {selectContainer(selectedNavItem)}
    </Layout>  )
}

export default Author