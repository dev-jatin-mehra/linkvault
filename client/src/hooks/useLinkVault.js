import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./useAuth";
import {
  createCollection,
  createLink,
  deleteCollection,
  deleteLink,
  getAnalyticsOverview,
  getCollectionMembers,
  getCollections,
  getLinks,
  removeCollectionMember,
  searchLinks,
  shareCollection,
  trackLinkClick,
  updateCollection,
  updateLink,
} from "../api/api";

export default function useLinkVault() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const [collections, setCollections] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [links, setLinks] = useState([]);
  const [members, setMembers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [isCollectionsLoading, setIsCollectionsLoading] = useState(false);
  const [isLinksLoading, setIsLinksLoading] = useState(false);
  const [isMembersLoading, setIsMembersLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCollections = async () => {
      if (!isLoaded) return;

      if (!isSignedIn) {
        setCollections([]);
        setSelectedId(null);
        setLinks([]);
        setMembers([]);
        setSearchQuery("");
        setSearchResults([]);
        setAnalytics(null);
        return;
      }

      setIsCollectionsLoading(true);
      setError("");

      try {
        const token = await getToken();
        const nextCollections = await getCollections(token);
        setCollections(nextCollections);

        if (!nextCollections.length) {
          setSelectedId(null);
          setLinks([]);
          setMembers([]);
          return;
        }

        setSelectedId((previousSelectedId) => {
          const shouldKeepSelected = nextCollections.some(
            (item) => item.id === previousSelectedId,
          );
          return shouldKeepSelected
            ? previousSelectedId
            : nextCollections[0].id;
        });
      } catch (requestError) {
        setError(requestError.message || "Failed to load collections.");
      } finally {
        setIsCollectionsLoading(false);
      }
    };

    loadCollections();
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    const loadLinks = async () => {
      if (!isLoaded || !isSignedIn || !selectedId) {
        if (!selectedId) setLinks([]);
        return;
      }

      setIsLinksLoading(true);
      setError("");

      try {
        const token = await getToken();
        const nextLinks = await getLinks(selectedId, token);
        setLinks(nextLinks);
      } catch (requestError) {
        setError(requestError.message || "Failed to load links.");
      } finally {
        setIsLinksLoading(false);
      }
    };

    loadLinks();
  }, [selectedId, isLoaded, isSignedIn]);

  useEffect(() => {
    const loadMembers = async () => {
      if (!isLoaded || !isSignedIn || !selectedId) {
        setMembers([]);
        return;
      }

      setIsMembersLoading(true);

      try {
        const token = await getToken();
        const nextMembers = await getCollectionMembers(selectedId, token);
        setMembers(nextMembers);
      } catch {
        setMembers([]);
      } finally {
        setIsMembersLoading(false);
      }
    };

    loadMembers();
  }, [selectedId, isLoaded, isSignedIn]);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!isLoaded || !isSignedIn) {
        setAnalytics(null);
        return;
      }

      try {
        const token = await getToken();
        const data = await getAnalyticsOverview(token);
        setAnalytics(data);
      } catch {
        setAnalytics(null);
      }
    };

    loadAnalytics();
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    const runSearch = async () => {
      if (!isSignedIn) {
        setSearchResults([]);
        return;
      }

      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);

      try {
        const token = await getToken();
        const results = await searchLinks(searchQuery.trim(), token);
        setSearchResults(results);
      } catch (requestError) {
        setError(requestError.message || "Search failed.");
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(runSearch, 180);
    return () => clearTimeout(timer);
  }, [searchQuery, isSignedIn]);

  // Real-time polling for collections updates
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const pollCollections = async () => {
      try {
        const token = await getToken();
        const nextCollections = await getCollections(token);
        setCollections(nextCollections);
      } catch {
        // Silent failure for background polling
      }
    };

    const interval = setInterval(pollCollections, 2000); // Poll every 2 seconds for immediate updates
    return () => clearInterval(interval);
  }, [isLoaded, isSignedIn]);

  // Real-time polling for links updates (click counts, new links)
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !selectedId) return;

    const pollLinks = async () => {
      try {
        const token = await getToken();
        const nextLinks = await getLinks(selectedId, token);
        setLinks(nextLinks);
      } catch {
        // Silent failure for background polling
      }
    };

    const interval = setInterval(pollLinks, 1000); // Poll every 1 second for immediate click count updates
    return () => clearInterval(interval);
  }, [isLoaded, isSignedIn, selectedId]);

  // Real-time polling for analytics updates
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const pollAnalytics = async () => {
      try {
        const token = await getToken();
        const data = await getAnalyticsOverview(token);
        setAnalytics(data);
      } catch {
        // Silent failure for background polling
      }
    };

    const interval = setInterval(pollAnalytics, 5000); // Poll every 5 seconds for immediate analytics refresh
    return () => clearInterval(interval);
  }, [isLoaded, isSignedIn]);

  const selectedCollection = useMemo(
    () => collections.find((item) => item.id === selectedId) || null,
    [collections, selectedId],
  );

  const addCollection = async (name, isPublic = false) => {
    if (!name?.trim() || !isSignedIn) return;

    setError("");

    try {
      const token = await getToken();
      const created = await createCollection(name.trim(), token, isPublic);

      setCollections((prev) => [created, ...prev]);
      if (!selectedId) setSelectedId(created.id);
    } catch (requestError) {
      setError(requestError.message || "Failed to create collection.");
      throw requestError;
    }
  };

  const selectCollection = (id) => setSelectedId(id);

  const editCollection = async (id, payload) => {
    const isPayloadString = typeof payload === "string";
    const trimmedName = isPayloadString
      ? payload.trim()
      : String(payload?.name || "").trim();

    if (!isSignedIn || !id || !trimmedName) return;

    setError("");

    try {
      const token = await getToken();
      const updated = await updateCollection(
        id,
        {
          name: trimmedName,
          is_public: isPayloadString ? undefined : payload?.is_public,
        },
        token,
      );

      if (!updated) throw new Error("Collection not found.");

      setCollections((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updated } : item)),
      );
    } catch (requestError) {
      setError(requestError.message || "Failed to update collection.");
      throw requestError;
    }
  };

  const removeCollection = async (id) => {
    if (!isSignedIn || !id) return;

    setError("");

    try {
      const token = await getToken();
      await deleteCollection(id, token);

      setCollections((prev) => {
        const nextCollections = prev.filter((item) => item.id !== id);

        if (selectedId === id) {
          const nextSelectedId = nextCollections[0]?.id || null;
          setSelectedId(nextSelectedId);
          if (!nextSelectedId) {
            setLinks([]);
            setMembers([]);
          }
        }

        return nextCollections;
      });
    } catch (requestError) {
      setError(requestError.message || "Failed to delete collection.");
      throw requestError;
    }
  };

  const toggleCollectionVisibility = async (id, isPublic) => {
    const collection = collections.find((item) => item.id === id);
    if (!collection) return;

    await editCollection(id, {
      name: collection.name,
      is_public: Boolean(isPublic),
    });
  };

  const shareWithMember = async (
    collectionId,
    memberUserId,
    role = "viewer",
  ) => {
    if (!collectionId || !memberUserId?.trim() || !isSignedIn) return;

    setError("");

    try {
      const token = await getToken();
      const member = await shareCollection(
        collectionId,
        { memberUserId: memberUserId.trim(), role },
        token,
      );

      setMembers((prev) => {
        const withoutCurrent = prev.filter(
          (item) => item.user_id !== member.user_id,
        );
        return [member, ...withoutCurrent];
      });
    } catch (requestError) {
      setError(requestError.message || "Share failed.");
      throw requestError;
    }
  };

  const removeMember = async (collectionId, memberUserId) => {
    if (!collectionId || !memberUserId || !isSignedIn) return;

    setError("");

    try {
      const token = await getToken();
      await removeCollectionMember(collectionId, memberUserId, token);
      setMembers((prev) =>
        prev.filter((item) => item.user_id !== memberUserId),
      );
    } catch (requestError) {
      setError(requestError.message || "Member removal failed.");
      throw requestError;
    }
  };

  const addLink = async ({ url, title, tags = [] }) => {
    if (!isSignedIn || !selectedId || !url?.trim()) return;

    setError("");

    try {
      const token = await getToken();
      const created = await createLink(
        {
          collection_id: selectedId,
          url: url.trim(),
          title: title?.trim() || "",
          tags,
        },
        token,
      );
      setLinks((prev) => [created, ...prev]);
    } catch (requestError) {
      setError(requestError.message || "Failed to add link.");
      throw requestError;
    }
  };

  const editLink = async (id, { url, title, tags = [] }) => {
    if (!isSignedIn || !id || !url?.trim()) return;

    setError("");

    try {
      const token = await getToken();
      const updated = await updateLink(
        id,
        {
          url: url.trim(),
          title: title?.trim() || "",
          tags,
        },
        token,
      );

      if (!updated) throw new Error("Link not found.");

      setLinks((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updated } : item)),
      );
      setSearchResults((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updated } : item)),
      );
    } catch (requestError) {
      setError(requestError.message || "Failed to update link.");
      throw requestError;
    }
  };

  const removeLink = async (id) => {
    if (!isSignedIn || !id) return;

    setError("");

    try {
      const token = await getToken();
      await deleteLink(id, token);
      setLinks((prev) => prev.filter((item) => item.id !== id));
      setSearchResults((prev) => prev.filter((item) => item.id !== id));
    } catch (requestError) {
      setError(requestError.message || "Failed to delete link.");
      throw requestError;
    }
  };

  const trackClick = async (id) => {
    if (!id || !isSignedIn) return;

    // Optimistic update - increment immediately
    const updateClickCount = (prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, click_count: (item.click_count || 0) + 1 }
          : item,
      );

    setLinks(updateClickCount);
    setSearchResults(updateClickCount);

    try {
      const token = await getToken();
      const response = await trackLinkClick(id, token);

      // Confirm with server response
      const confirmClickCount = (prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, click_count: response.click_count ?? item.click_count }
            : item,
        );

      setLinks(confirmClickCount);
      setSearchResults(confirmClickCount);
    } catch {
      // If API fails, the optimistic update remains (acceptable for click tracking)
    }
  };

  return {
    collections,
    selectedId,
    selectedCollection,
    links,
    members,
    analytics,
    searchQuery,
    searchResults,
    isCollectionsLoading,
    isLinksLoading,
    isMembersLoading,
    isSearching,
    error,
    isLoaded,
    isSignedIn,
    setSearchQuery,
    addCollection,
    editCollection,
    removeCollection,
    toggleCollectionVisibility,
    shareWithMember,
    removeMember,
    selectCollection,
    addLink,
    editLink,
    removeLink,
    trackClick,
  };
}
