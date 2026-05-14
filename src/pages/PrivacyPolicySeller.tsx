import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { MarkdownDisplay } from "../components/MarkdownDisplay";

export function PrivacyPolicySeller() {
  return (
    <MarkdownDisplay 
      filePath="/privacy-policy-seller.md" 
      title="Chính sách bảo mật cho người bán" 
    />
  );
}
