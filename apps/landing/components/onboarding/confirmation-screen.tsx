"use client";

import { CheckCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmationScreenProps {
  businessName: string;
}

export function ConfirmationScreen({ businessName }: ConfirmationScreenProps) {
  const botNumber = "201000000000";

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
        <CheckCircle className="h-10 w-10 text-success" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-foreground">تم التسجيل بنجاح!</h2>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          هنبعتلك رسالة على واتساب في ثواني. افتح واتساب واستنى رسالة البوت —
          وبعدها تقدر تبدأ تعمل لينكات دفع فوري!
        </p>
      </div>

      <a
        href={`https://wa.me/${botNumber}?text=Test+100`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button className="h-12 w-full rounded-xl bg-[#25D366] text-base font-bold text-white hover:bg-[#20BD5A]">
          <MessageCircle className="ml-2 h-5 w-5" />
          جرّب تعمل لينك دفع تجريبي
        </Button>
      </a>

      <p className="text-xs text-muted-foreground">
        محتاج مساعدة؟{" "}
        <a
          href={`https://wa.me/${botNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          كلمنا على واتساب
        </a>
      </p>
    </div>
  );
}
