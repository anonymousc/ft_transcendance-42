import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

function AcceptTerms() {
  return (
    <div className="flex items-start gap-2.5">
      <Checkbox id="terms" className="mt-0.5 size-4 shrink-0" />
      <Label htmlFor="terms" className="text-sm font-normal leading-snug text-gray-600 dark:text-gray-400 cursor-pointer">
        Accept terms and conditions
      </Label>
    </div>
  );
}

export default AcceptTerms;
