"use client"

import { Search, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { KeyboardEvent, useState, useEffect, useCallback } from "react"

type Props = {
    search: string
}

export default function ServiceSearch(props: Props) {
    const [keyword, setKeyword] = useState<string>(props.search)
    const router = useRouter()

    // Debounce function
    const debounce = (func: Function, delay: number) => {
        let timeoutId: NodeJS.Timeout
        return (...args: any[]) => {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => func(...args), delay)
        }
    }

    // Sync keyword with props when props change
    useEffect(() => {
        setKeyword(props.search)
    }, [props.search])

    const performSearch = useCallback((searchKeyword: string) => {
        const params = new URLSearchParams(window.location.search)
        
        if (searchKeyword.trim() === '') {
            params.delete("search")
        } else {
            params.set("search", searchKeyword.trim())
        }
        
        router.push('/admin/services' + (params.toString() ? '?' + params.toString() : ''))
    }, [router])

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce((value: string) => {
            performSearch(value)
        }, 500), // Delay 500ms setelah user berhenti mengetik
        [performSearch]
    )

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value
        setKeyword(value)
        debouncedSearch(value)
    }

    function handleClear() {
        setKeyword('')
        performSearch('')
    }

    return (
        <div className="w-full max-w-md">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    id="search"
                    className="pl-10 pr-12 py-2.5 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-300 bg-white text-gray-900"
                    value={keyword}
                    onChange={handleChange}
                    placeholder="Search services by name, ID, or price..."
                    aria-label="Search services"
                />
                {keyword && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Clear search"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
            
            <div className="mt-2 flex gap-2">
                <button
                    type="button"
                    onClick={() => performSearch(keyword)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-medium flex items-center gap-2 shadow-sm hover:shadow"
                >
                    <Search className="h-4 w-4" />
                    Search
                </button>
                {keyword && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 text-sm font-medium flex items-center gap-2"
                    >
                        <X className="h-4 w-4" />
                        Clear
                    </button>
                )}
            </div>
            
            {keyword && (
                <div className="mt-2 text-sm text-gray-500">
                    Search will automatically update as you type
                </div>
            )}
        </div>
    )
}