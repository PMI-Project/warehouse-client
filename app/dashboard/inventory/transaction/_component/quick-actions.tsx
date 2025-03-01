'use client';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function QuickActions() {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => router.push('/dashboard/inventory/batch/new')}
        className="flex items-center gap-2"
      >
        <PlusCircle className="h-4 w-4" />
        Add Batch
      </Button>

      <Button
        onClick={() => router.push('/dashboard/inventory/tags/new')}
        className="flex items-center gap-2"
      >
        <PlusCircle className="h-4 w-4" />
        Add Tag
      </Button>

      <Button
        onClick={() => router.push('/dashboard/inventory/products/new')}
        className="flex items-center gap-2"
      >
        <PlusCircle className="h-4 w-4" />
        Add Product
      </Button>
    </div>
  );
} 