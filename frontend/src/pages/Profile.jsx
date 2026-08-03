import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../services/api";
import ProfileHeader from "../components/Profile/ProfileHeader";
import ProfileGrid from "../components/Profile/ProfileGrid";
import ConnectionsModal from "../components/Profile/ConnectionsModal";

const Profile = () => {
  const { id } = useParams();
  const [userDetails, setUserDetails] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isYouFollowed, setIsYouFollowed] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(true);

  // Connections overlay state
  const [showConnectionsModal, setShowConnectionsModal] = useState(false);
  const [connectionModalType, setConnectionModalType] = useState(null);
  const [connectionsList, setConnectionsList] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(false);

  const fetchUserDetails = async () => {
    try {
      const data = await api.getUserDetails(id);
      if (data.success) {
        setUserDetails(data.data);
        setIsYouFollowed(data.action === "Follow" || data.data.isYoufollowed);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const fetchMyPosts = async () => {
    try {
      const data = await api.getMyPosts(id);
      if (data.success) {
        setPosts(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    try {
      const data = await api.toggleFollow(id);
      if (data.success) {
        const isFollowedNow = data.action === "follow";
        toast.success(isFollowedNow ? "Followed Successfully!" : "Unfollowed Successfully!");
        setIsYouFollowed(isFollowedNow);
        setUserDetails((prev) =>
          prev
            ? {
                ...prev,
                followers: isFollowedNow ? prev.followers + 1 : Math.max(0, prev.followers - 1)
              }
            : null
        );
      } else {
        toast.error(data.msg);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleOpenConnectionsModal = async (type) => {
    setConnectionModalType(type);
    setShowConnectionsModal(true);
    setLoadingConnections(true);
    try {
      const data =
        type === "followers" ? await api.getFollowersList(id) : await api.getFollowingList(id);
      if (data.success) {
        setConnectionsList(data.data || []);
      } else {
        toast.error(data.msg);
      }
    } catch (err) {
      toast.error(`Failed to fetch ${type}`);
    } finally {
      setLoadingConnections(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setShowConnectionsModal(false);

    Promise.all([fetchUserDetails(), fetchMyPosts()]).finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading || !userDetails) {
    return (
      <div className="flex flex-col items-center w-full min-h-screen bg-ig-bg pt-8 px-4 pb-20">
        <div className="w-full max-w-[935px] animate-pulse">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16 mb-12 border-b border-ig-border pb-12">
            <div className="w-[150px] h-[150px] rounded-full bg-ig-border skeleton-shimmer"></div>
            <div className="flex-1 flex flex-col gap-4">
              <div className="h-6 w-48 rounded bg-ig-border skeleton-shimmer"></div>
              <div className="h-5 w-72 rounded bg-ig-border skeleton-shimmer mt-2"></div>
              <div className="h-4 w-96 rounded bg-ig-border skeleton-shimmer mt-2"></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-ig-border rounded-xl skeleton-shimmer"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-ig-bg pt-8 px-4 pb-20 transition-all duration-300">
      <div className="w-full max-w-[935px]">
        <ProfileHeader
          userDetails={userDetails}
          isYouFollowed={isYouFollowed}
          onToggleFollow={handleToggleFollow}
          onOpenConnectionsModal={handleOpenConnectionsModal}
        />

        <ProfileGrid posts={posts} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <ConnectionsModal
        show={showConnectionsModal}
        onClose={() => setShowConnectionsModal(false)}
        modalType={connectionModalType}
        connectionsList={connectionsList}
        loading={loadingConnections}
      />
    </div>
  );
};

export default Profile;
