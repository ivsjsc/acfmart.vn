import { useEffect, useState } from "react"

/**
 * Trả về giá trị được debounce sau `delay` ms.
 * Dùng cho ô tìm kiếm admin để tránh tạo lại subscription/query Firestore
 * trên mỗi ký tự gõ.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}
