import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { NewPartnerForm } from "@/components/partner/new-partner-form";

export default function NewPartnerPage() {
  return (
    <div className="px-6 sm:px-10 py-8 max-w-2xl mx-auto flex flex-col gap-6">
      <Link href={"/partners" as any} className="flex items-center gap-1.5 text-sm text-fog hover:text-paper w-fit">
        <ArrowLeft className="h-4 w-4" />
        Назад к партнёрам
      </Link>

      <Card className="p-6 sm:p-8">
        <h1 className="font-display text-lg font-medium text-paper mb-1">Новый партнёр</h1>
        <p className="text-sm text-fog mb-6">
          Заполни то, что знаешь сейчас — остальное можно добавить позже прямо в карточке партнёра.
        </p>

        <NewPartnerForm />
      </Card>
    </div>
  );
}
