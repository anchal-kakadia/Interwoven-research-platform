'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Layout from '../../components/Layout'
import AdminReviewSubmission from '../../components/Admin/AdminReviewSubmission';
import AdminReviewerList from '../../components/Admin/AdminReviewerList';
import AdminApproveReview from '../../components/Admin/AdminApproveReview';
import AdminSendMail from '../../components/Admin/AdminSendMail';
import AdminAcceptedSubmission from '../../components/Admin/AdminAcceptedSubmission'
import AdminInReviewSubmission from '../../components/Admin/AdminInReviewSubmission'
import AdminAuthorList from '../../components/Admin/AdminAuthorList'

const page = () => {
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
      case 'Review Submissions':
        return <AdminReviewSubmission />
        break;
      case 'Reviewers':
        return <AdminReviewerList />
        break;
      case 'Authors': 
        return <AdminAuthorList />
        break;
      case 'Approve Reviews':
        return <AdminApproveReview />
        break;
      case 'Invite':
        return <AdminSendMail />
        break;
      case 'Submissions Accepted':
        return <AdminAcceptedSubmission />
        break;
      case 'Submissions InReview':
        return <AdminInReviewSubmission />
      default:
        break;
    }
  }


  return (
    <Layout type={'admin'} handleNavItemClick={handleNavItemClick} selectedNavItem={selectedNavItem}>
      {selectContainer(selectedNavItem)}
    </Layout>
  )
}

export default page