import { useEffect, useState } from "react";
import axios from "axios";

export const useWrappedData = (accessToken) => {
  const [isLoading, setIsLoading] = useState(true);
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [topGenre, setTopGenre] = useState("");
  const [topSongImg, setTopSongImg] = useState("");

  const fetch = async (endpoint) => {
    const result = await axios.get(`https://api.spotify.com/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return result.data;
  };

  const getArtists = async (idList) => {
    return (await fetch(`v1/artists?ids=${encodeURIComponent(idList)}`))
      .artists;
  };

  const getTopTracks = async () => {
    const topTracks = (
      await fetch("v1/me/top/tracks?time_range=short_term&limit=50")
    ).items;
    setSongs(topTracks.slice(0, 5).map((track) => track.name));
    setTopSongImg(topTracks[0].album.images[0].url);
    return topTracks;
  };

  const getTopArtists = async () => {
    const topArtists = (
      await fetch("v1/me/top/artists?time_range=short_term&limit=50")
    ).items;
    setArtists(topArtists.slice(0, 5).map((artist) => artist.name));
    return topArtists;
  };

  const getRecentlyPlayed = async () => {
    const recentlyPlayed = (await fetch("v1/me/player/recently-played?limit=1"))
      .items;
    setRecentlyPlayed(recentlyPlayed[0].track.name);
  };

  const findMostFrequent = (array) => {
    const countMap = new Map();
    let mostFrequent = array[0];
    let maxCount = 0;
    array.forEach((item) => {
      const count = (countMap.get(item) || 0) + 1;
      countMap.set(item, count);
      if (count > maxCount) {
        mostFrequent = item;
        maxCount = count;
      }
    });
    return mostFrequent.charAt(0).toUpperCase() + mostFrequent.slice(1);
  };

  const getIdList = async (trackArtistIds) => {
    let idList = "";
    const length = trackArtistIds.length;
    if (trackArtistIds) {
      trackArtistIds.forEach((id, index) => {
        if (index === length - 1) {
          idList += id;
        } else {
          idList += `${id},`;
        }
      });
    }
    return idList;
  };

  const getTopGenre = async () => {
    const topTracks = await getTopTracks();
    const topArtists = await getTopArtists();
    // converts an array of Spotify's TrackObject into an array of Spotify's ArtistObject
    const trackArtists = topTracks.map((item) => item.artists).flat();
    // converts an array of Spotify's ArtistObject into an array of their associated ids
    const trackArtistIds = trackArtists.map((item) => item.id);
    let idsFirstSet = await getIdList(trackArtistIds.splice(0, 38)); // idList is limited to 38 items
    let idsSecondSet = await getIdList(trackArtistIds.splice(38));
    const topTrackArtistsFirstSet = await getArtists(idsFirstSet);
    const topTrackArtistsSecondSet = await getArtists(idsSecondSet);
    // converts an array of Spotify's ArtistObject into an array of their associated genres
    const trackArtistGenres = topTrackArtistsFirstSet.concat(topTrackArtistsSecondSet).map(item => item.genres).flat();
    const artistGenres = topArtists.map((item) => item.genres).flat();
    const topGenres = trackArtistGenres.concat(artistGenres);
    const topGenre = findMostFrequent(topGenres)
    setTopGenre(topGenre);
    setIsLoading(false);
  }

  useEffect(() => {
    getTopGenre();
    getRecentlyPlayed();
  }, []);

  return { isLoading, songs, artists, recentlyPlayed, topGenre, topSongImg };
};
