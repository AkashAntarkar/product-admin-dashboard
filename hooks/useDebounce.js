import { useEffect, useState } from "react";

// Delays updating the returned value until `delay` ms after the last
// change to `value`. Used so we only call the search API once the
// user has stopped typing, instead of on every keystroke.
export default function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
