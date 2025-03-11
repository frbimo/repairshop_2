"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export type ComboboxOption = {
    value: string
    label: string
}

interface ComboboxProps {
    options: ComboboxOption[]
    value: string
    onChange: (value: string) => void
    placeholder?: string
    emptyMessage?: string
    className?: string
    disabled?: boolean
    allowCustomValue?: boolean
}

export function Combobox({
    options,
    value,
    onChange,
    placeholder = "Select option...",
    emptyMessage = "No results found.",
    className,
    disabled = false,
    allowCustomValue = false,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")
    const [filteredOptions, setFilteredOptions] = React.useState<ComboboxOption[]>(options)
    const comboboxRef = React.useRef<HTMLDivElement>(null)

    // Initialize input value from props
    React.useEffect(() => {
        if (value) {
            const option = options.find((opt) => opt.value === value)
            setInputValue(option ? option.label : value)
        } else {
            setInputValue("")
        }
    }, [value, options])

    // Filter options based on input
    React.useEffect(() => {
        if (inputValue) {
            const filtered = options.filter((option) => option.label.toLowerCase().includes(inputValue.toLowerCase()))
            setFilteredOptions(filtered)
        } else {
            setFilteredOptions(options)
        }
    }, [options, inputValue])

    // Handle clicks outside the combobox
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setInputValue(newValue)
        setOpen(true)

        if (allowCustomValue) {
            onChange(newValue)
        }
    }

    const handleOptionClick = (option: ComboboxOption) => {
        setInputValue(option.label)
        onChange(option.value)
        setOpen(false)
    }

    return (
        <div ref={comboboxRef} className="relative w-full">
            <div className="relative">
                <Input
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => setOpen(true)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={className}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setOpen(!open)}
                    disabled={disabled}
                >
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
            </div>

            {open && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-popover rounded-md border border-input shadow-md max-h-60 overflow-auto">
                    {filteredOptions.length > 0 ? (
                        <ul className="py-1">
                            {filteredOptions.map((option) => (
                                <li
                                    key={option.value}
                                    className={cn(
                                        "flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                                        value === option.value && "bg-accent text-accent-foreground",
                                    )}
                                    onClick={() => handleOptionClick(option)}
                                >
                                    <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                                    {option.label}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-2 py-4 text-sm text-center text-muted-foreground">{emptyMessage}</div>
                    )}
                </div>
            )}
        </div>
    )
}

