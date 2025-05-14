export const PLACEHOLDER_IMAGES = {
  // Campaign Categories
  medical: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=60",
  education: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=60",
  religious: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&auto=format&fit=crop&q=60",
  ngo: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=60",
  government: "https://images.unsplash.com/photo-1575505586569-646b2ca898fc?w=800&auto=format&fit=crop&q=60",
  
  // Specific Campaign Images
  cancer: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=60",
  temple: "https://images.unsplash.com/photo-1545506475-5a0985c3ca50?w=800&auto=format&fit=crop&q=60",
  girlsEducation: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&auto=format&fit=crop&q=60",
  cleanWater: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&auto=format&fit=crop&q=60",
  smartClassroom: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&auto=format&fit=crop&q=60",
  floodRelief: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=60",
  
  // User Avatars
  admin: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=60",
  ngo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=60",
  donor: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=60",
  
  // Dashboard Stats
  totalDonations: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop&q=60",
  activeCampaigns: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop&q=60",
  communityImpact: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=60",
  
  // Campaign Cards
  campaign1: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=60",
  campaign2: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=60",
  campaign3: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=60",
  
  // Default Images
  defaultAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=60",
  defaultCampaign: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=60",
  defaultDashboard: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop&q=60",
} as const;

export const getCampaignImage = (category: keyof typeof PLACEHOLDER_IMAGES) => {
  return PLACEHOLDER_IMAGES[category] || PLACEHOLDER_IMAGES.defaultCampaign;
};

export const getUserAvatar = (role: "admin" | "ngo" | "donor") => {
  return PLACEHOLDER_IMAGES[role] || PLACEHOLDER_IMAGES.defaultAvatar;
}; 