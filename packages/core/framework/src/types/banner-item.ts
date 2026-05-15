export interface BannerItem {
  id: string;
  image_url: string;
  link_url: string;
  title?: string;
  position: number;
  active: boolean;
  created_at: firebase.firestore.FieldValue;
  updated_at: firebase.firestore.FieldValue;
  source: string;
}