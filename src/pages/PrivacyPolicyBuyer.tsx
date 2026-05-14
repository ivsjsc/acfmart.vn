import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { MarkdownDisplay } from "../components/MarkdownDisplay";

export function PrivacyPolicyBuyer() {
  return (
    <MarkdownDisplay 
      filePath="/privacy-policy-buyer.md" 
      title="Chính sách bảo mật cho người mua" 
    />
  );
}
