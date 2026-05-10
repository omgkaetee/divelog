export interface MarineSpecies {
  id: string
  name: string
  scientificName: string
  category: string
  imageUrl?: string
}

const LOCAL_SPECIES: MarineSpecies[] = [
  { id: '1', name: 'Reef Shark', scientificName: 'Carcharhinus melanopterus', category: 'Shark' },
  { id: '2', name: 'Whitetip Shark', scientificName: 'Triaenodon obesus', category: 'Shark' },
  { id: '3', name: 'Hammerhead Shark', scientificName: 'Sphyrna lewini', category: 'Shark' },
  { id: '4', name: 'Tiger Shark', scientificName: 'Galeocerdo cuvier', category: 'Shark' },
  { id: '5', name: 'Nurse Shark', scientificName: 'Ginglymostoma cirratum', category: 'Shark' },
  { id: '6', name: 'Grey Reef Shark', scientificName: 'Carcharhinus amblyrhynchos', category: 'Shark' },
  { id: '7', name: 'Silvertip Shark', scientificName: 'Carcharhinus albimarginatus', category: 'Shark' },
  { id: '8', name: 'Whitetip Reef Shark', scientificName: 'Triaenodon obesus', category: 'Shark' },
  { id: '21', name: 'Manta Ray', scientificName: 'Manta birostris', category: 'Ray' },
  { id: '22', name: 'Stingray', scientificName: 'Dasyatis spp.', category: 'Ray' },
  { id: '23', name: 'Eagle Ray', scientificName: 'Myliobatis californica', category: 'Ray' },
  { id: '24', name: 'Cownose Ray', scientificName: 'Rhinoptera bonasus', category: 'Ray' },
  { id: '31', name: 'Sea Turtle', scientificName: 'Chelonia mydas', category: 'Turtle' },
  { id: '32', name: 'Hawksbill Turtle', scientificName: 'Eretmochelys imbricata', category: 'Turtle' },
  { id: '33', name: 'Green Turtle', scientificName: 'Chelonia mydas', category: 'Turtle' },
  { id: '41', name: 'Giant Grouper', scientificName: 'Epinephelus lanceolatus', category: 'Grouper' },
  { id: '42', name: 'Black Grouper', scientificName: 'Mycteroperca bonaci', category: 'Grouper' },
  { id: '43', name: 'Red Grouper', scientificName: 'Epinephelus morio', category: 'Grouper' },
  { id: '44', name: 'Nassau Grouper', scientificName: 'Epinephelus striatus', category: 'Grouper' },
  { id: '51', name: 'Clownfish', scientificName: 'Amphiprion ocellaris', category: 'Fish' },
  { id: '52', name: 'Parrotfish', scientificName: 'Scarus ghobban', category: 'Fish' },
  { id: '53', name: 'Damselfish', scientificName: 'Pomacentrus spp.', category: 'Fish' },
  { id: '54', name: 'Wrasse', scientificName: 'Thalassoma lutescens', category: 'Fish' },
  { id: '55', name: 'Surgeonfish', scientificName: 'Acanthurus lineatus', category: 'Fish' },
  { id: '56', name: 'Butterflyfish', scientificName: 'Chaetodon auriga', category: 'Fish' },
  { id: '57', name: 'Angelfish', scientificName: 'Pygoplites diacanthus', category: 'Fish' },
  { id: '58', name: 'Cardinalfish', scientificName: 'Sphaeramia nematoptera', category: 'Fish' },
  { id: '71', name: 'Tuna', scientificName: 'Thunnus albacares', category: 'Pelagic' },
  { id: '72', name: 'Mahi Mahi', scientificName: 'Coryphaena hippurus', category: 'Pelagic' },
  { id: '73', name: 'Barracuda', scientificName: 'Sphyraena barracuda', category: 'Pelagic' },
  { id: '74', name: 'Giant Trevally', scientificName: 'Caranx ignobilis', category: 'Pelagic' },
  { id: '75', name: 'Jack', scientificName: 'Caranx melampygus', category: 'Pelagic' },
  { id: '81', name: 'Octopus', scientificName: 'Octopus vulgaris', category: 'Invertebrate' },
  { id: '82', name: 'Squid', scientificName: 'Loligo vulgaris', category: 'Invertebrate' },
  { id: '83', name: 'Lobster', scientificName: 'Panulirus argus', category: 'Invertebrate' },
  { id: '84', name: 'Sea Urchin', scientificName: 'Diadema setosum', category: 'Invertebrate' },
  { id: '91', name: 'Moray Eel', scientificName: 'Gymnothorax javanicus', category: 'Eel' },
  { id: '92', name: 'Garden Eel', scientificName: 'Gorgasia sillneri', category: 'Eel' },
  { id: '101', name: 'Dolphin', scientificName: 'Delphinus delphis', category: 'Mammal' },
  { id: '102', name: 'Sea Lion', scientificName: 'Zalophus californianus', category: 'Mammal' },
  { id: '111', name: 'Mola Mola', scientificName: 'Mola mola', category: 'Fish' },
  { id: '112', name: 'Lionfish', scientificName: 'Pterois volitans', category: 'Fish' },
  { id: '113', name: 'Frogfish', scientificName: 'Antennarius spp.', category: 'Fish' },
  { id: '114', name: 'Batfish', scientificName: 'Platax orbicularis', category: 'Fish' },
  { id: '115', name: 'Moorish Idol', scientificName: 'Zanclus cornutus', category: 'Fish' },
  { id: '116', name: 'Flounder', scientificName: 'Bothus lunatus', category: 'Fish' },
]

export function searchMarineSpecies(query: string, limit = 20): MarineSpecies[] {
  if (!query || query.length < 1) return LOCAL_SPECIES.slice(0, limit)
  
  const searchLower = query.toLowerCase()
  return LOCAL_SPECIES
    .filter(s => 
      s.name.toLowerCase().includes(searchLower) ||
      s.scientificName.toLowerCase().includes(searchLower) ||
      s.category.toLowerCase().includes(searchLower)
    )
    .slice(0, limit)
}