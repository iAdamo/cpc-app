export interface Place {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  address_components: {
    types?: string[];
  }[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}
