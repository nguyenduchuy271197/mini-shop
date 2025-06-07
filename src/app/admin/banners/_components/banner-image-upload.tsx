"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface BannerImageUploadProps {
  imageUrl: string;
  onImageChange: (url: string) => void;
}

export default function BannerImageUpload({ imageUrl, onImageChange }: BannerImageUploadProps) {
  const { toast } = useToast();

  return (
    <div>
      <Label>Hình ảnh banner *</Label>
      <div className="space-y-4">
        <Input
          value={imageUrl}
          onChange={(e) => onImageChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
        />

        {imageUrl && (
          <div className="relative inline-block">
            <img 
              src={imageUrl} 
              alt="Preview"
              className="max-w-sm h-32 object-cover rounded border"
              onError={() => {
                toast({
                  title: "Lỗi",
                  description: "Không thể tải hình ảnh từ URL này",
                  variant: "destructive",
                });
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="absolute top-2 right-2"
              onClick={() => onImageChange("")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
