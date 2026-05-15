export interface BannerItem {
  id: string;
  image_url: string;
  link_url: string;
  title: string;
  position: number;
  active: boolean;
  source: "firestore" | "remote_config";
  created_at?: any;
  updated_at?: any;
}