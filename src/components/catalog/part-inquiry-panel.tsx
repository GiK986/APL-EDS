'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { PartV2Dto } from '@/types/yq';
import { t, type Lang } from '@/lib/i18n';

interface PartInquiryPanelProps {
  part: PartV2Dto | null;
  onClose: () => void;
  lang: Lang;
}

export function PartInquiryPanel({ part, onClose, lang }: PartInquiryPanelProps) {
  return (
    <Sheet open={!!part} onOpenChange={(open) => !open && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t('oemInquiryTitle', lang)}</SheetTitle>
        </SheetHeader>
        {part && (
          <div className="text-sm">
            <div className="font-mono font-medium">
              {part.partNumberFormatted ?? part.partNumber}
            </div>
            <div className="text-muted-foreground">{part.displayName || part.partName}</div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
