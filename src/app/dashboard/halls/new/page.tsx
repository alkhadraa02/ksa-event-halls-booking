import { HallForm } from "@/components/hall-form";

export default function NewHall() {
  return (
    <div>
      <h1 className="text-2xl font-bold">إضافة قاعة</h1>
      <div className="card mt-4 p-4 sm:p-6">
        <HallForm />
      </div>
    </div>
  );
}
