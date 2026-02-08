// src/services/api.js
const API_BASE_URL = 'https://views.3speak.tv';
const PLAY_BASE_URL = 'https://play.3speak.tv/api';

export const fetchShorts = async (page = 1, limit = 10) => {
  try {
    const response = await fetch(`${API_BASE_URL}/shorts?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch shorts');
    return await response.json();
  } catch (error) {
    console.error('Error fetching shorts:', error);
    throw error;
  }
};

export const fetchVideoDetails = async (owner, permlink) => {
  try {
    const response = await fetch(`${PLAY_BASE_URL}/embed?v=${owner}/${permlink}`);
    if (!response.ok) throw new Error('Failed to fetch video details');
    return await response.json();
  } catch (error) {
    console.error('Error fetching video details:', error);
    throw error;
  }
};

const HIVE_API_NODE = 'https://api.hive.blog';

export const fetchHivePost = async (author, permlink) => {
  try {
    const response = await fetch(HIVE_API_NODE, {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'condenser_api.get_content',
        params: [author, permlink],
        id: 1,
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error fetching Hive post:', error);
    return null;
  }
};

export const fetchHiveComments = async (author, permlink) => {
  try {
    // get_content_replies returns immediate children (comments)
    const response = await fetch(HIVE_API_NODE, {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'condenser_api.get_content_replies',
        params: [author, permlink],
        id: 1,
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    return data.result || [];
  } catch (error) {
    console.error('Error fetching Hive comments:', error);
    return [];
  }
};

export const fetchHiveAccount = async (username) => {
  try {
    const response = await fetch(HIVE_API_NODE, {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'condenser_api.get_accounts',
        params: [[username]],
        id: 1,
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    return data.result && data.result.length > 0 ? data.result[0] : null;
  } catch (error) {
    console.error('Error fetching Hive account:', error);
    return null;
  }
};

export const fetchUserVideos = async (username, page = 1, limit = 100) => {
  try {
    // Fetching generic shorts and filtering client-side because API filtering is not working for owner
    // We increase default limit to scan more items
    const response = await fetch(`${API_BASE_URL}/shorts?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch user videos');
    const data = await response.json();

    // Filter by owner
    const filteredShorts = data.shorts ? data.shorts.filter(video => video.owner === username) : [];

    // Return filtered shorts and metadata to allow continued paging
    return {
      shorts: filteredShorts,
      totalPages: data.totalPages,
      apiTotal: data.total
    };
  } catch (error) {
    console.error('Error fetching user videos:', error);
    return { shorts: [], totalPages: 0 };
  }
};
