import { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const languages = [
  { value: "ar", label: "العربية", region: "Middle East" },
  { value: "en", label: "English", region: "Global" },
  { value: "es", label: "Español", region: "Spanish" },
  { value: "fr", label: "Français", region: "French" },
  { value: "hi", label: "हिन्दी", region: "India" },
  { value: "ru", label: "Русский", region: "Russia" },
  { value: "zh", label: "中文", region: "China" },
  { value: "ur", label: "اردو", region: "Pakistan" },
  { value: "fa", label: "فارسی", region: "Iran" },
  { value: "tr", label: "Türkçe", region: "Turkey" },
];

interface LanguageSelectorProps {
  onSelect: (languages: string[]) => void;
  value?: string[];
}

export function LanguageSelector({ onSelect, value = [] }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(value);

  useEffect(() => {
    setSelectedLanguages(value);
  }, [value]);

  const toggleLanguage = (langValue: string) => {
    const newSelection = selectedLanguages.includes(langValue)
      ? selectedLanguages.filter(l => l !== langValue)
      : [...selectedLanguages, langValue];
    
    setSelectedLanguages(newSelection);
    onSelect(newSelection);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedLanguages.length > 0
            ? `${selectedLanguages.length} languages selected`
            : "Select languages..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search languages..." />
          <CommandEmpty>No language found.</CommandEmpty>
          <CommandGroup>
            {languages.map((language) => (
              <CommandItem
                key={language.value}
                value={language.value}
                onSelect={() => toggleLanguage(language.value)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedLanguages.includes(language.value)
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                <span className="flex-1">{language.label}</span>
                <span className="text-muted-foreground text-sm">
                  {language.region}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
