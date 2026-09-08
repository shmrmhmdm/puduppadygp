export const PENSION_SCHEMES = [
  { id: 'all', name_ml: 'എല്ലാ പെൻഷനുകളും', name_en: 'All Schemes' },
  { id: 'IGNOAP', name_ml: 'ഇന്ദിരാഗാന്ധി വാർദ്ധക്യകാല പെൻഷൻ', name_en: 'Indira Gandhi Old Age Pension', short_ml: 'വാർദ്ധക്യകാല പെൻഷൻ', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'AGRLAB', name_ml: 'കർഷകത്തൊഴിലാളി പെൻഷൻ', name_en: 'Agricultural Labourer Pension', short_ml: 'കർഷകത്തൊഴിലാളി പെൻഷൻ', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'WIDOW', name_ml: 'വിധവാ പെൻഷൻ', name_en: 'Widow Pension', short_ml: 'വിധവാ പെൻഷൻ', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'DISAB', name_ml: 'വികലാംഗ പെൻഷൻ (ഭിന്നശേഷി)', name_en: 'Disability Pension', short_ml: 'വികലാംഗ പെൻഷൻ', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'UNMARR', name_ml: '50 വയസ്സ് കഴിഞ്ഞ അവിവാഹിത വനിതാ പെൻഷൻ', name_en: 'Unmarried Women Pension (50+)', short_ml: 'അവിവാഹിത വനിതാ പെൻഷൻ', color: 'bg-rose-100 text-rose-800 border-rose-200' },
];

// 1 to 25 standard ward numbers list for Grama Panchayats
export const WARDS_LIST = Array.from({ length: 25 }, (_, i) => {
  const wardNo = i + 1;
  const padNo = wardNo < 10 ? `0${wardNo}` : `${wardNo}`;
  return {
    id: wardNo,
    name_ml: `വാർഡ് ${padNo}`,
    name_en: `Ward ${padNo}`,
    member_ml: `വാർഡ് ${padNo} മെമ്പർ`,
    member_en: `Ward ${padNo} Member`,
  };
});

// All dummy beneficiary records removed - starts clean with empty array
export const INITIAL_BENEFICIARIES = [];
