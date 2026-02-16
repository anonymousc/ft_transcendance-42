import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

function AcceptTerms() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms" className="text-sm font-normal text-gray-600 dark:text-gray-400 cursor-pointer">
        Accept terms and conditions
      </Label>
    </div>
  );
}

export default AcceptTerms;
