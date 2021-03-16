import { useState, useEffect } from 'react';
import { getProfileData } from '../util/QueryEngine';

const useProfile = function(webId) {
  const [profile, setProfile] = useState(undefined);

  useEffect(() => {
    let mounted = true
    const getProfile = async () => {
      if(!webId) return
      const profile = await getProfileData(webId)
      if (mounted) {
        if(profile) {
          setProfile(profile)
        } else {
          setProfile(null)
        }
      } 
    }
    getProfile();
    return () => mounted = false
  }, [webId])
  return profile
}

export default useProfile