import { useNavigate } from "react-router-dom";
import { PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center animate-in fade-in duration-300">
      <PackageSearch className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />

      <p className="font-mono text-6xl font-semibold tracking-tight text-foreground sm:text-7xl">
        404
      </p>

      <p className="max-w-sm text-sm text-muted-foreground">
        The page you're looking for doesn't exist.
      </p>

      <Button onClick={() => navigate("/dashboard")} className="mt-3">
        Back to Dashboard
      </Button>
    </div>
  );
}